import { Injectable, computed, signal } from '@angular/core';
import { NoteEnseignant, ReclamationRecue, SaisieNote } from './models/enseignant.model';

/**
 * Donnees mockees pour l'espace enseignant, en attendant le backend.
 *
 * TODO (integration backend) :
 *  - POST /api/notes { ... , statut: 'brouillon' } -> Note
 *      (implemente Enseignant#saisirNote())
 *  - PATCH /api/notes/{id} { statut: 'validee' | 'publiee' | ... }
 *      (implemente Enseignant#modifierNote())
 *  - GET /api/enseignants/moi/reclamations -> ReclamationRecue[]
 *  - PATCH /api/reclamations/{id} { statut: 'traitee' }
 *      (implemente Reclamation#traiter())
 */
@Injectable({ providedIn: 'root' })
export class EnseignantData {
  readonly matieres = ['Algorithmique', 'Bases de données', 'Programmation Web'];
  readonly etudiants = ['Étudiant Démo (L3 GL)', 'Amine Ben Salah (L3 GL)', 'Sarra Trabelsi (L3 GL)'];
  readonly typesEvaluation = ['CC', 'TP', 'Examen'];
  readonly semestres = ['L1-S1', 'L1-S2', 'L2-S1', 'L2-S2', 'L3-S1'];

  private readonly notesSignal = signal<NoteEnseignant[]>([
    { id: crypto.randomUUID(), etudiant: 'Étudiant Démo', matiere: 'Algorithmique', type: 'CC', semestre: 'L1-S1', note: 16, coefficient: 1, statut: 'publiee', reclamee: false },
    { id: crypto.randomUUID(), etudiant: 'Étudiant Démo', matiere: 'Algorithmique', type: 'Examen', semestre: 'L1-S1', note: 14, coefficient: 2, statut: 'publiee', reclamee: false },
    { id: crypto.randomUUID(), etudiant: 'Étudiant Démo', matiere: 'Bases de données', type: 'TP', semestre: 'L2-S1', note: 15, coefficient: 1, statut: 'publiee', reclamee: false },
    { id: crypto.randomUUID(), etudiant: 'Étudiant Démo', matiere: 'Bases de données', type: 'Examen', semestre: 'L2-S1', note: 12.5, coefficient: 2, statut: 'publiee', reclamee: false },
    { id: crypto.randomUUID(), etudiant: 'Étudiant Démo', matiere: 'Programmation Web', type: 'CC', semestre: 'L3-S1', note: 14, coefficient: 1, statut: 'publiee', reclamee: false },
    { id: crypto.randomUUID(), etudiant: 'Étudiant Démo', matiere: 'Programmation Web', type: 'Examen', semestre: 'L3-S1', note: 16, coefficient: 2, statut: 'publiee', reclamee: false },
    { id: crypto.randomUUID(), etudiant: 'Amine Ben Salah', matiere: 'Algorithmique', type: 'CC', semestre: 'L3-S1', note: 11, coefficient: 1, statut: 'publiee', reclamee: false },
    { id: crypto.randomUUID(), etudiant: 'Amine Ben Salah', matiere: 'Algorithmique', type: 'Examen', semestre: 'L3-S1', note: 13, coefficient: 2, statut: 'publiee', reclamee: false },
    { id: crypto.randomUUID(), etudiant: 'Sarra Trabelsi', matiere: 'Algorithmique', type: 'CC', semestre: 'L3-S1', note: 17, coefficient: 1, statut: 'publiee', reclamee: false },
    { id: crypto.randomUUID(), etudiant: 'Sarra Trabelsi', matiere: 'Bases de données', type: 'TP', semestre: 'L3-S1', note: 16, coefficient: 1, statut: 'publiee', reclamee: false },
  ]);

  private readonly reclamationsSignal = signal<ReclamationRecue[]>([]);

  readonly notes = this.notesSignal.asReadonly();
  readonly reclamations = this.reclamationsSignal.asReadonly();

  readonly brouillons = computed(() => this.notesSignal().filter((n) => n.statut === 'brouillon'));
  readonly validees = computed(() => this.notesSignal().filter((n) => n.statut === 'validee'));
  readonly publiees = computed(() => this.notesSignal().filter((n) => n.statut === 'publiee'));
  readonly reclamationsOuvertes = computed(() => this.reclamationsSignal().filter((r) => r.statut === 'ouverte'));

  enregistrerBrouillon(saisie: SaisieNote): void {
    const nouvelleNote: NoteEnseignant = {
      id: crypto.randomUUID(),
      ...saisie,
      statut: 'brouillon',
      reclamee: false,
    };
    this.notesSignal.update((liste) => [...liste, nouvelleNote]);
  }

  validerBrouillon(id: string): void {
    this.notesSignal.update((liste) =>
      liste.map((n) => (n.id === id ? { ...n, statut: 'validee' } : n))
    );
  }

  publierNote(id: string): void {
    this.notesSignal.update((liste) =>
      liste.map((n) => (n.id === id ? { ...n, statut: 'publiee' } : n))
    );
  }

  modifierNote(id: string, note: number, coefficient: number): void {
    this.notesSignal.update((liste) =>
      liste.map((n) => (n.id === id ? { ...n, note, coefficient } : n))
    );
  }

  traiterReclamation(id: string): void {
    this.reclamationsSignal.update((liste) =>
      liste.map((r) => (r.id === id ? { ...r, statut: 'traitee' } : r))
    );
  }
}