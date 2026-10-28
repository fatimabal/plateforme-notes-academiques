import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../core/notification.service';

const SEUIL_DIFFICULTE = 13;

@Component({
  selector: 'app-espace-chef-departement',
  imports: [CommonModule, RouterLink],
  templateUrl: './espace-chef-departement.html',
  styleUrl: './espace-chef-departement.scss',
})
export class EspaceChefDepartement implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api';
  protected readonly notif = inject(NotificationService);
  protected afficherNotifs = signal(false);

  protected readonly nomChef = localStorage.getItem('nom') ?? 'Chef Département';

  private readonly toutesLesNotes = signal<any[]>([]);
  private readonly toutesLesReclamations = signal<any[]>([]);

  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  // Semestres extraits des vraies notes
  protected readonly semestres = computed(() => {
    const s = new Set<string>();
    for (const n of this.toutesLesNotes()) {
      const sem = n.evaluation?.semestre?.libelle ?? n.evaluation?.matiere?.ue?.semestre?.libelle;
      if (sem) s.add(sem);
    }
    return s.size > 0 ? Array.from(s) : ['—'];
  });

  protected readonly semestreSelectionne = signal('');

  protected readonly notesDuSemestre = computed(() => {
    const sem = this.semestreSelectionne();
    if (!sem || sem === '—') return this.toutesLesNotes();
    return this.toutesLesNotes().filter(n => {
      const s = n.evaluation?.semestre?.libelle ?? n.evaluation?.matiere?.ue?.semestre?.libelle;
      return s === sem;
    });
  });

  protected readonly tableauBord = computed(() => {
    const notes = this.notesDuSemestre();
    if (notes.length === 0) return null;

    const reclamations = this.toutesLesReclamations();
    const reclamationsTotal = reclamations.length;
    const reclamationsTraitees = reclamations.filter(r => r.statut === 'traitee').length;

    const valeurs = notes.map(n => Number(n.valeur)).filter(v => !isNaN(v));
    const moyenneGenerale = valeurs.length
      ? Math.round((valeurs.reduce((a, b) => a + b, 0) / valeurs.length) * 10) / 10
      : 0;
    const tauxReussite = valeurs.length
      ? Math.round((valeurs.filter(v => v >= 10).length / valeurs.length) * 100)
      : 0;
    const etudiantsEvalues = new Set(notes.map(n => n.etudiant_id)).size;

    // Moyennes par classe
    const parClasse = new Map<string, number[]>();
    for (const n of notes) {
      const classe = n.etudiant?.classe?.nomClasse ?? 'Inconnue';
      if (!parClasse.has(classe)) parClasse.set(classe, []);
      parClasse.get(classe)!.push(Number(n.valeur));
    }
    const moyennesParClasse = Array.from(parClasse.entries()).map(([classe, vals]) => ({
      classe,
      etudiants: new Set(notes.filter(n => (n.etudiant?.classe?.nomClasse ?? 'Inconnue') === classe).map(n => n.etudiant_id)).size,
      moyenne: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10,
    }));

    // Distribution
    const tranches = [
      { tranche: '0–5', min: 0, max: 5 },
      { tranche: '6–9', min: 6, max: 9 },
      { tranche: '10–12', min: 10, max: 12 },
      { tranche: '13–15', min: 13, max: 15 },
      { tranche: '16–20', min: 16, max: 20 },
    ];
    const distribution = tranches.map(t => ({
      tranche: t.tranche,
      count: valeurs.filter(v => v >= t.min && v <= t.max).length,
    }));

    // Moyennes par module
    const parModule = new Map<string, number[]>();
    for (const n of notes) {
      const mod = n.evaluation?.matiere?.libelle ?? 'Inconnu';
      if (!parModule.has(mod)) parModule.set(mod, []);
      parModule.get(mod)!.push(Number(n.valeur));
    }
    const moyennesParModule = Array.from(parModule.entries()).map(([module, vals]) => ({
      module,
      notes: vals.length,
      moyenne: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10,
    }));

    return { tauxReussite, etudiantsEvalues, moyenneGenerale, reclamationsTotal, reclamationsTraitees, moyennesParClasse, distribution, moyennesParModule };
  });

  protected readonly maxDistribution = computed(() => {
    const t = this.tableauBord();
    if (!t || !t.distribution.length) return 1;
    return Math.max(1, ...t.distribution.map(d => d.count));
  });

  protected readonly meilleuresPerformances = computed(() => {
    const t = this.tableauBord();
    if (!t) return [];
    return [...t.moyennesParModule].sort((a, b) => b.moyenne - a.moyenne).slice(0, 3);
  });

  protected readonly modulesLesPlusFaibles = computed(() => {
    const t = this.tableauBord();
    if (!t) return [];
    return [...t.moyennesParModule].sort((a, b) => a.moyenne - b.moyenne).slice(0, 3);
  });

  protected readonly classesEnDifficulte = computed(() => {
    const t = this.tableauBord();
    if (!t) return [];
    return t.moyennesParClasse.filter(c => c.moyenne < SEUIL_DIFFICULTE);
  });

  ngOnInit(): void {
    this.notif.charger();
    this.http.get<any[]>(`${this.apiUrl}/notes/toutes`, { headers: this.headers }).subscribe({
      next: (data) => {
        this.toutesLesNotes.set(Array.isArray(data) ? data : []);
        const sems = this.semestres();
        if (sems.length > 0) this.semestreSelectionne.set(sems[0]);
      },
      error: () => this.toutesLesNotes.set([])
    });
    this.http.get<any[]>(`${this.apiUrl}/reclamations`, { headers: this.headers }).subscribe({
      next: (data) => this.toutesLesReclamations.set(Array.isArray(data) ? data : []),
      error: () => this.toutesLesReclamations.set([])
    });
  }

  protected selectionnerSemestre(semestre: string): void {
    this.semestreSelectionne.set(semestre);
  }

  protected largeurBarre(count: number): number {
    return (count / this.maxDistribution()) * 100;
  }
}