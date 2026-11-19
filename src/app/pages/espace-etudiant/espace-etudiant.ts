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
  protected readonly matricule = signal<string>('—');
  protected readonly dateNaissance = signal<string>('—');
  protected readonly lieuNaissance = signal<string>('—');
  protected readonly filiere = signal<string>('—');
  protected readonly ongletActif = signal<'notes' | 'reclamations' | 'profil'>('notes');
  protected readonly nomEtudiant = signal<string>('');
  protected readonly classe = signal<string>('—');
  protected readonly semestreSelectionneCode = signal<string | null>(null);

  // champs édition profil
  protected nomEdite = '';
  protected prenomEdite = '';
  protected readonly profilEnEdition = signal(false);

  // Notes brutes depuis l'API
  private readonly notesApi = signal<any[]>([]);
  private readonly semestresApi = signal<any[]>([]);

  // Bulletin
  protected readonly bulletinOuvert = signal(false);
  protected readonly bulletinData = signal<any>(null);
  protected readonly bulletinChargement = signal(false);

  // Réclamations
  protected readonly reclamationOuverte = signal<string | null>(null);
  protected readonly mesReclamations = signal<any[]>([]);
  protected motifReclamation = '';
  protected readonly reclamationsEnvoyees = signal<Set<string>>(new Set());

  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  protected readonly semestres = computed(() => {
    return this.semestresApi().map((s, i) => ({
      id: s.id,
      code: s.libelle,
      label: s.libelle,
      actuel: i === this.semestresApi().length - 1,
    }));
  });

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
        date: n.dateSaisie ?? n.evaluation?.dateEvaluation ?? '—',
      }));
      const total = evaluations.reduce((s, e) => s + e.note * e.coefficient, 0);
      const totalCoef = evaluations.reduce((s, e) => s + e.coefficient, 0);
      const moyenne = totalCoef > 0 ? Math.round((total / totalCoef) * 10) / 10 : 0;
      return { matiere, evaluations, moyenne };
    });
  });

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

    // Charger le profil (matricule, classe, infos personnelles)
    this.http.get<any>(`${this.apiUrl}/profile`, { headers: this.headers }).subscribe({
      next: (data) => {
        this.matricule.set(data.etudiant?.matricule ?? '—');
        this.dateNaissance.set(data.etudiant?.dateNaissance ?? '—');
        this.lieuNaissance.set(data.etudiant?.lieuNaissance ?? '—');
        this.filiere.set(data.etudiant?.filiere ?? '—');
        this.classe.set(data.etudiant?.classe ?? '—');
        this.nomEdite = data.nom ?? '';
        this.prenomEdite = data.prenom ?? '';
      },
      error: () => { }
    });

    // Charger les semestres
    this.http.get<any[]>(`${this.apiUrl}/semestres`, { headers: this.headers }).subscribe({
      next: (data) => {
        this.semestresApi.set(Array.isArray(data) ? data : []);
        const sems = this.semestres();
        if (sems.length > 0) {
          this.semestreSelectionneCode.set(sems[sems.length - 1].code);
        }
      },
      error: () => { }
    });

    // Charger les notes
    this.http.get<any>(`${this.apiUrl}/notes`, { headers: this.headers }).subscribe({
      next: (data) => {
        const notes = Array.isArray(data) ? data : (data?.notes ?? []);
        this.notesApi.set(notes);
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

  protected enregistrerProfil(): void {
    this.http.put(`${this.apiUrl}/profile`, {
      nom: this.nomEdite,
      prenom: this.prenomEdite,
    }, { headers: this.headers }).subscribe({
      next: () => {
        this.nomEtudiant.set(`${this.prenomEdite} ${this.nomEdite}`.trim());
        localStorage.setItem('nom', this.nomEdite);
        localStorage.setItem('prenom', this.prenomEdite);
        this.profilEnEdition.set(false);
        // Recharger le profil pour mettre à jour les infos
        this.http.get<any>(`${this.apiUrl}/profile`, { headers: this.headers }).subscribe({
          next: (data) => {
            this.matricule.set(data.etudiant?.matricule ?? '—');
            this.dateNaissance.set(data.etudiant?.dateNaissance ?? '—');
            this.lieuNaissance.set(data.etudiant?.lieuNaissance ?? '—');
            this.filiere.set(data.etudiant?.filiere ?? '—');
            this.classe.set(data.etudiant?.classe ?? '—');
          },
          error: () => { }
        });
      },
      error: () => { }
    });
  }
  protected chargerReclamations(): void {
    this.http.get<any[]>(`${this.apiUrl}/reclamations/mes-reclamations`, { headers: this.headers }).subscribe({
      next: (data) => this.mesReclamations.set(Array.isArray(data) ? data : []),
      error: () => { }
    });
  }


  protected relancerReclamation(id: number): void {
    this.http.post(`${this.apiUrl}/reclamations/${id}/relancer`, {}, { headers: this.headers }).subscribe({
      next: () => this.chargerReclamations(),
      error: (e) => console.error(e)
    });
  }
protected voirBulletin(): void {
  const semestreCode = this.semestreSelectionneCode();
  console.log('voirBulletin appelé, semestreCode:', semestreCode);
  this.bulletinChargement.set(true);
  this.bulletinOuvert.set(true);
  this.bulletinData.set(null);

  this.http.get<any>(`${this.apiUrl}/bulletins/mes-bulletins`, { headers: this.headers })
    .subscribe({
      next: (data) => {
        console.log('bulletins reçus:', data);
        const bulletins = data.bulletins ?? [];
        let bulletin = null;
        if (semestreCode) {
          bulletin = bulletins.find((b: any) => b.semestre?.libelle === semestreCode);
        }
        if (!bulletin && bulletins.length > 0) {
          bulletin = bulletins[0];
        }
        console.log('bulletin sélectionné:', bulletin);
        this.bulletinData.set(bulletin ?? null);
        this.bulletinChargement.set(false);
      },
      error: (e) => {
        console.log('erreur:', e);
        this.bulletinData.set(null);
        this.bulletinChargement.set(false);
      }
    });
}
protected fermerBulletin(): void {
  this.bulletinOuvert.set(false);
  this.bulletinData.set(null);
}
}