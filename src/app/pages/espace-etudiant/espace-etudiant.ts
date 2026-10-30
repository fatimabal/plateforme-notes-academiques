import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-espace-etudiant',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './espace-etudiant.html',
  styleUrl: './espace-etudiant.scss',
})
export class EspaceEtudiant implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api';
  protected readonly notif = inject(NotificationService);
  protected afficherNotifs = signal(false);

  // Profil étudiant
  protected readonly nomEtudiant = signal<string>('');
  protected readonly classe = signal<string>('—');
  protected readonly semestreSelectionneCode = signal<string | null>(null);

  // Notes brutes depuis l'API
  private readonly notesApi = signal<any[]>([]);
  private readonly semestresApi = signal<any[]>([]);

  // Réclamations
  protected readonly reclamationOuverte = signal<string | null>(null);
  protected motifReclamation = '';
  protected readonly reclamationsEnvoyees = signal<Set<string>>(new Set());

  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  // Liste des semestres pour les boutons
  protected readonly semestres = computed(() => {
    return this.semestresApi().map((s, i) => ({
      id: s.id,
      code: s.libelle,
      label: s.libelle,
      actuel: i === this.semestresApi().length - 1,
    }));
  });

  // Notes du semestre sélectionné, groupées par matière
protected readonly modulesAffiches = computed(() => {
    const code = this.semestreSelectionneCode();
    const notes = this.notesApi().filter(n => n.semestre?.libelle === code);

    const parMatiere = new Map<string, any[]>();
    for (const n of notes) {
      const mat = n.matiere?.libelle ?? '—';
      if (!parMatiere.has(mat)) parMatiere.set(mat, []);
      parMatiere.get(mat)!.push(n);
    }

    return Array.from(parMatiere.entries()).map(([matiere, notes]) => {
      const evaluations = notes.map(n => ({
        id: n.id,
        type: n.type ?? n.evaluation?.typeEvaluation ?? '—',
        note: n.valeur,
        coefficient: n.coefficient ?? 1,
        date: n.dateSaisie ?? '—',
      }));
      const total = evaluations.reduce((s, e) => s + e.note * e.coefficient, 0);
      const totalCoef = evaluations.reduce((s, e) => s + e.coefficient, 0);
      const moyenne = totalCoef > 0 ? Math.round((total / totalCoef) * 10) / 10 : 0;
      return { matiere, evaluations, moyenne };
    });
  });

  // Moyenne globale du semestre
  protected readonly moyenneSemestre = computed(() => {
const mods = this.modulesAffiches();
    if (mods.length === 0) return null;
    const total = mods.reduce((s, m) => s + m.moyenne, 0);
    return Math.round((total / mods.length) * 10) / 10;
  });

  ngOnInit(): void {
    this.notif.charger();

    // Nom depuis localStorage
    const prenom = localStorage.getItem('prenom') ?? '';
    const nom = localStorage.getItem('nom') ?? '';
    this.nomEtudiant.set(`${prenom} ${nom}`.trim() || 'Étudiant');

    // Charger les semestres
    this.http.get<any[]>(`${this.apiUrl}/semestres`, { headers: this.headers }).subscribe({
      next: (data) => {
        this.semestresApi.set(Array.isArray(data) ? data : []);
        const sems = this.semestres();
        if (sems.length > 0) {
          const actuel = sems[sems.length - 1];
          this.semestreSelectionneCode.set(actuel.code);
        }
      },
      error: () => {}
    });

    // Charger les notes de l'étudiant
    this.http.get<any>(`${this.apiUrl}/notes`, { headers: this.headers }).subscribe({
      next: (data) => {
        const notes = Array.isArray(data) ? data : (data?.notes ?? []);
        this.notesApi.set(notes);
        // Classe depuis la première note
        const premiere = notes[0];
        const cls = premiere?.etudiant?.inscription?.[0]?.classe?.nomClasse ?? '—';
        this.classe.set(cls);
      },
      error: () => this.notesApi.set([])
    });
  }

  protected selectionnerSemestre(code: string): void {
    this.semestreSelectionneCode.set(code);
    this.reclamationOuverte.set(null);
  }

  protected cleLigne(matiere: string, type: string): string {
    return `${matiere}|${type}`;
  }

  protected ouvrirReclamation(matiere: string, type: string): void {
    this.reclamationOuverte.set(this.cleLigne(matiere, type));
    this.motifReclamation = '';
  }

  protected annulerReclamation(): void {
    this.reclamationOuverte.set(null);
  }

  protected envoyerReclamation(matiere: string, type: string): void {
    if (!this.motifReclamation.trim()) return;

    // Trouver l'id de la note correspondante
    const code = this.semestreSelectionneCode();
    const note = this.notesApi().find(n =>
      n.semestre?.libelle === code &&
      (n.matiere?.libelle ?? '—') === matiere &&
      (n.type ?? n.evaluation?.typeEvaluation ?? '—') === type
    );

    if (note) {
      this.http.post(`${this.apiUrl}/reclamations`, {
        note_id: note.id,
        motif: this.motifReclamation,
      }, { headers: this.headers }).subscribe({
        next: () => {
          this.reclamationsEnvoyees.update(set => {
            const copie = new Set(set);
            copie.add(this.cleLigne(matiere, type));
            return copie;
          });
          this.reclamationOuverte.set(null);
        },
        error: (e) => console.error(e)
      });
    }
  }

  protected estReclamee(matiere: string, type: string): boolean {
    return this.reclamationsEnvoyees().has(this.cleLigne(matiere, type));
  }

  protected reinitialiser(): void {
    const sems = this.semestres();
    if (sems.length > 0) this.semestreSelectionneCode.set(sems[sems.length - 1].code);
    this.reclamationOuverte.set(null);
  }
}