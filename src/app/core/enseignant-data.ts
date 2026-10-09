import { Injectable, computed, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import type { NoteEnseignant, ReclamationRecue, SaisieNote } from './models/enseignant.model';

@Injectable({ providedIn: 'root' })
export class EnseignantData {
  readonly matieres = ['Programmation Web', 'Algorithmique', 'Base de donn?es', 'R?seaux', 'Math?matiques'];
  readonly etudiants = ['Alice Yaya (L3 GL)', 'Brahim Diallo (L2 SI)', 'Sonia Koffi (L3 SI)', 'Mouhamed Bah (L3 GL)'];
  readonly typesEvaluation = ['CC', 'TP', 'Projet', 'Examen'];
  readonly semestres = ['L1-S1', 'L1-S2', 'L2-S1', 'L2-S2', 'L3-S1', 'L3-S2'];

  private readonly notes = signal<NoteEnseignant[]>([
    { id: 'n1', etudiant: 'Alice Yaya', matiere: 'Programmation Web', type: 'CC', semestre: 'L3-S1', note: 15.5, coefficient: 2, statut: 'validee', reclamee: false },
    { id: 'n2', etudiant: 'Brahim Diallo', matiere: 'Base de donn?es', type: 'TP', semestre: 'L2-S2', note: 14.0, coefficient: 1, statut: 'brouillon', reclamee: true },
    { id: 'n3', etudiant: 'Mouhamed Bah', matiere: 'Algorithmique', type: 'Examen', semestre: 'L3-S1', note: 13.0, coefficient: 3, statut: 'publiee', reclamee: false }
  ]);

  readonly brouillons = computed(() => this.notes().filter((n) => n.statut === 'brouillon'));
  readonly validees = computed(() => this.notes().filter((n) => n.statut === 'validee'));
  readonly publiees = computed(() => this.notes().filter((n) => n.statut === 'publiee'));
  readonly reclamationsOuvertes = computed<ReclamationRecue[]>(() =>
    this.notes()
      .filter((n) => n.reclamee)
      .map((n) => ({
        id: n.id,
        etudiant: n.etudiant,
        matiere: n.matiere,
        type: n.type,
        motif: 'R?clamation enregistr?e par l??tudiant',
        statut: 'ouverte',
      }))
  );

  saisirNote(note: SaisieNote): Observable<any> {
    this.notes.update((liste) => [
      ...liste,
      {
        id: crypto.randomUUID(),
        etudiant: note.etudiant.replace(/\s*\(.*\)$/, ''),
        matiere: note.matiere,
        type: note.type,
        semestre: note.semestre,
        note: note.note,
        coefficient: note.coefficient,
        statut: 'brouillon',
        reclamee: false,
      }
    ]);
    return of({ success: true });
  }

  enregistrerBrouillon(payload: any): void {
    this.notes.update((liste) => [
      ...liste,
      {
        id: crypto.randomUUID(),
        etudiant: payload.etudiant,
        matiere: payload.matiere,
        type: payload.type,
        semestre: payload.semestre,
        note: payload.note,
        coefficient: payload.coefficient,
        statut: 'brouillon',
        reclamee: false,
      }
    ]);
  }

  modifierNote(noteId: string, valeur: number, coefficient: number): Observable<any> {
    this.notes.update((liste) => liste.map((note) =>
      note.id === noteId ? { ...note, note: valeur, coefficient } : note
    ));
    return of({ success: true });
  }

  traiterReclamation(id: string): void {
    this.notes.update((liste) => liste.map((note) =>
      note.id === id ? { ...note, reclamee: false, statut: 'validee' } : note
    ));
  }

  validerBrouillon(id: string): void {
    this.notes.update((liste) => liste.map((note) =>
      note.id === id ? { ...note, statut: 'validee' } : note
    ));
  }

  publierNote(id: string): void {
    this.notes.update((liste) => liste.map((note) =>
      note.id === id ? { ...note, statut: 'publiee' } : note
    ));
  }

  getEvaluations(): Observable<any> {
    return of([
      { type: 'CC', note: 14.5, coefficient: 2, date: '2026-09-15' },
      { type: 'Examen', note: 16.0, coefficient: 3, date: '2026-10-02' }
    ]);
  }
}
