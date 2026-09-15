import { Injectable, signal } from '@angular/core';
import { DeliberationSemestre } from './models/examens.model';

/**
 * Donnees mockees pour l'espace Service des examens, en attendant le backend.
 *
 * TODO (integration backend) :
 *  - GET /api/examens/deliberations?semestre=... -> DeliberationSemestre
 *  - POST /api/examens/deliberations/{semestre}/lancer
 *      (implemente ServiceDesExamens#gererDeliberation() du diagramme de
 *       classes : passe toutes les lignes du semestre en 'delibere')
 */
@Injectable({ providedIn: 'root' })
export class ExamensData {
  readonly semestres = ['L1-S1', 'L1-S2', 'L2-S1', 'L2-S2', 'L3-S1', 'L3-S2'];

  private readonly deliberationsSignal = signal<Record<string, DeliberationSemestre>>({
    'L1-S1': { semestre: 'L1-S1', lignes: [] },
    'L1-S2': { semestre: 'L1-S2', lignes: [] },
    'L2-S1': { semestre: 'L2-S1', lignes: [] },
    'L2-S2': { semestre: 'L2-S2', lignes: [] },
    'L3-S1': {
      semestre: 'L3-S1',
      lignes: [
        {
          etudiant: 'Étudiant Démo',
          classe: 'L3 GL',
          notesPubliees: 2,
          notesAttendues: 2,
          moyenne: 15.33,
          decision: 'delibere',
          observation: 'admins',
        },
      ],
    },
    'L3-S2': { semestre: 'L3-S2', lignes: [] },
  });

  readonly deliberations = this.deliberationsSignal.asReadonly();

  getDeliberation(semestre: string): DeliberationSemestre {
    return this.deliberationsSignal()[semestre] ?? { semestre, lignes: [] };
  }

  lancerDeliberation(semestre: string): void {
    this.deliberationsSignal.update((dict) => {
      const actuel = dict[semestre];
      if (!actuel) return dict;
      return {
        ...dict,
        [semestre]: {
          ...actuel,
          lignes: actuel.lignes.map((l) => ({ ...l, decision: 'delibere' })),
        },
      };
    });
  }
}