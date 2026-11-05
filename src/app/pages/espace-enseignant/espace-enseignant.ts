import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-espace-enseignant',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './espace-enseignant.html',
  styleUrl: './espace-enseignant.scss',
})
export class EspaceEnseignant implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly apiUrl = 'http://localhost:8000/api';
  protected readonly notif = inject(NotificationService);
  protected afficherNotifs = signal(false);

  protected readonly nomEnseignant =
    `${localStorage.getItem('prenom') ?? ''} ${localStorage.getItem('nom') ?? ''}`.trim() || 'Enseignant';

  // Onglets
  protected readonly ongletActif = signal<'tableau' | 'profil'>('tableau');

  // Profil
  protected readonly profilNom = signal('');
  protected readonly profilPrenom = signal('');
  protected readonly profilEmail = signal('');
  protected readonly profilRole = signal('');
  protected readonly profilEnEdition = signal(false);
  protected nomEdite = '';
  protected prenomEdite = '';

  // Données API
  protected matieres = signal<any[]>([]);
  protected classes = signal<any[]>([]);
  protected classeSelectionnee = signal<number | null>(null);
  protected rechercheEtudiant = '';
  protected etudiants = signal<any[]>([]);
  protected readonly typesEvaluation = ['Devoir', 'Examen', 'TP', 'Projet'];
  protected semestres = signal<any[]>([]);

  protected readonly etudiantsFiltres = computed(() => {
    const classeId = this.classeSelectionnee();
    const q = this.rechercheEtudiant.toLowerCase();
    let liste = this.etudiants();
    if (classeId) {
      liste = liste.filter(e => e.classe_id === classeId || e.inscription?.[0]?.classe_id === classeId);
    }
    if (q) {
      liste = liste.filter(e =>
        (e.user?.nom + ' ' + e.user?.prenom + ' ' + e.matricule).toLowerCase().includes(q)
      );
    }
    return liste;
  });

  // Notes par statut
  private readonly toutesLesNotes = signal<any[]>([]);
  protected readonly brouillons = computed(() =>
    this.toutesLesNotes().filter(n => n.statut === 'brouillon')
  );
  protected readonly validees = computed(() =>
    this.toutesLesNotes().filter(n => n.statut === 'valide' || n.statut === 'validee')
  );
  protected readonly publiees = computed(() =>
    this.toutesLesNotes().filter(n => n.statut === 'publie' || n.statut === 'publiee')
  );
  protected readonly reclamationsOuvertes = signal<any[]>([]);

  // Formulaire saisie
  protected readonly form = this.fb.group({
    matiere_id: [null as number | null, Validators.required],
    etudiant_id: [null as number | null, Validators.required],
    type: [this.typesEvaluation[0], Validators.required],
    semestre_id: [null as number | null, Validators.required],
    note: [null as number | null, [Validators.required, Validators.min(0), Validators.max(20)]],
    coefficient: [1, [Validators.required, Validators.min(1)]],
  });

  // Édition en ligne
  protected readonly noteEnEdition = signal<number | null>(null);
  protected noteEditee: number | null = null;
  protected coefficientEdite: number | null = null;

  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  ngOnInit(): void {
    this.notif.charger();
    this.chargerDonnees();
    this.chargerProfil();
  }

  private chargerProfil(): void {
    this.http.get<any>(`${this.apiUrl}/profile`, { headers: this.headers }).subscribe({
      next: (data) => {
        this.profilNom.set(data.nom ?? '');
        this.profilPrenom.set(data.prenom ?? '');
        this.profilEmail.set(data.email ?? '');
        this.profilRole.set(data.role ?? '');
        this.nomEdite = data.nom ?? '';
        this.prenomEdite = data.prenom ?? '';
      },
      error: () => {}
    });
  }

  private chargerDonnees(): void {
    this.http.get<any[]>(`${this.apiUrl}/matieres`, { headers: this.headers }).subscribe({
      next: (data) => this.matieres.set(Array.isArray(data) ? data : []),
      error: () => {}
    });

    this.http.get<any[]>(`${this.apiUrl}/classes`, { headers: this.headers }).subscribe({
      next: (data) => this.classes.set(Array.isArray(data) ? data : []),
      error: () => {}
    });

    this.http.get<any[]>(`${this.apiUrl}/etudiants-liste`, { headers: this.headers }).subscribe({
      next: (data) => this.etudiants.set(Array.isArray(data) ? data : []),
      error: () => {}
    });

    this.http.get<any[]>(`${this.apiUrl}/semestres`, { headers: this.headers }).subscribe({
      next: (data) => this.semestres.set(Array.isArray(data) ? data : []),
      error: () => {}
    });

    this.http.get<any[]>(`${this.apiUrl}/notes/mes-notes`, { headers: this.headers }).subscribe({
      next: (data) => this.toutesLesNotes.set(Array.isArray(data) ? data : []),
      error: () => this.toutesLesNotes.set([])
    });

    this.http.get<any[]>(`${this.apiUrl}/reclamations`, { headers: this.headers }).subscribe({
      next: (data) => this.reclamationsOuvertes.set((Array.isArray(data) ? data : []).filter((r: any) => r.statut !== 'traitee')),
      error: () => {}
    });
  }

  protected enregistrerBrouillon(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.http.post(`${this.apiUrl}/notes`, {
      matiere_id: v.matiere_id,
      etudiant_id: v.etudiant_id,
      type: v.type,
      semestre_id: v.semestre_id,
      valeur: v.note,
      coefficient: v.coefficient,
      statut: 'brouillon',
    }, { headers: this.headers }).subscribe({
      next: () => {
        this.form.patchValue({ note: null, coefficient: 1 });
        this.chargerDonnees();
      },
      error: (e) => console.error(e)
    });
  }

  protected validerBrouillon(id: number): void {
    this.http.put(`${this.apiUrl}/notes/${id}`, { statut: 'valide' }, { headers: this.headers }).subscribe({
      next: () => this.chargerDonnees(),
      error: (e) => console.error(e)
    });
  }

  protected publierNote(id: number): void {
    this.http.put(`${this.apiUrl}/notes/${id}`, { statut: 'publie' }, { headers: this.headers }).subscribe({
      next: () => this.chargerDonnees(),
      error: (e) => console.error(e)
    });
  }

  protected traiterReclamation(id: number): void {
    this.http.put(`${this.apiUrl}/reclamations/${id}`, { statut: 'traitee' }, { headers: this.headers }).subscribe({
      next: () => this.chargerDonnees(),
      error: (e) => console.error(e)
    });
  }

  protected ouvrirEdition(id: number, noteActuelle: number, coefficient: number): void {
    this.noteEnEdition.set(id);
    this.noteEditee = noteActuelle;
    this.coefficientEdite = coefficient;
  }

  protected annulerEdition(): void {
    this.noteEnEdition.set(null);
  }

  protected enregistrerEdition(id: number): void {
    if (this.noteEditee === null) return;
    this.http.put(`${this.apiUrl}/notes/${id}`, { valeur: this.noteEditee, coefficient: this.coefficientEdite }, { headers: this.headers }).subscribe({
      next: () => {
        this.noteEnEdition.set(null);
        this.chargerDonnees();
      },
      error: (e) => console.error(e)
    });
  }

  protected enregistrerProfil(): void {
    this.http.put(`${this.apiUrl}/profile`, {
      nom: this.nomEdite,
      prenom: this.prenomEdite,
    }, { headers: this.headers }).subscribe({
      next: () => {
        this.profilNom.set(this.nomEdite);
        this.profilPrenom.set(this.prenomEdite);
        localStorage.setItem('nom', this.nomEdite);
        localStorage.setItem('prenom', this.prenomEdite);
        this.profilEnEdition.set(false);
      },
      error: () => {}
    });
  }
}