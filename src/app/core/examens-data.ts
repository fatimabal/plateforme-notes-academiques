import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExamensData {
  readonly semestres = ['L1-S1', 'L1-S2', 'L2-S1', 'L2-S2', 'L3-S1', 'L3-S2'];

  private readonly deliberationsSignal = signal<Record<string, any>>({
    'L3-S1': {
      semestre: 'L3-S1',
      lignes: [
        { etudiant: 'Alice Yaya', classe: 'L3 GL', notesPubliees: 6, notesAttendues: 6, moyenne: 15.4, decision: 'attente', observation: 'Moyenne stable, ? valider' },
        { etudiant: 'Brahim Diallo', classe: 'L2 SI', notesPubliees: 5, notesAttendues: 6, moyenne: 14.1, decision: 'attente', observation: 'Une note manquante' }
      ]
    }
  });

  getSemestres(): Observable<string[]> {
    return of(this.semestres);
  }

  getDeliberation(semestre: string): any {
    return this.deliberationsSignal()[semestre] ?? { semestre, lignes: [] };
  }

  lancerDeliberation(semestre: string): void {
    this.deliberationsSignal.update((dict) => ({
      ...dict,
      [semestre]: {
        semestre,
        lignes: (dict[semestre]?.lignes ?? []).map((ligne: any) => ({ ...ligne, decision: 'delibere' }))
      }
    }));
  }

  validerNote(noteId: number): Observable<any> {
    return of({ success: true, noteId });
  }

  genererBulletin(data: any): Observable<any> {
    return of({ success: true, data });
  }
}
