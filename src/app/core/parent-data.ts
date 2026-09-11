import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DossierEnfant, Enfant } from './models/parent.model';
/**
 * Donnees mockees pour l'espace parent, en attendant le backend.
 *
 * TODO (integration backend) :
 *  - GET /api/parents/moi/enfants -> Enfant[]
 *      (implemente ParentEtudiant "avoir" Etudiant du diagramme de classes)
 *  - GET /api/etudiants/{id}/dossier -> DossierEnfant
 *      (implemente Bulletin, Note, Module, Evaluation relies a l'etudiant)
 */
@Injectable({ providedIn: 'root' })
export class ParentData {
  private readonly dossiers: Record<string, DossierEnfant> = {
    'etudiant-demo': {
      enfant: {
        id: 'etudiant-demo',
        nom: 'Étudiant Démo',
        filiere: 'L3 GL',
        semestreCourant: 'L3-S1',
      },
      semestres: [
        {
          semestre: 'L1-S1',
          moyenne: 13.67,
          lignes: [
            { matiere: 'Algorithmique', type: 'CC', note: 13, coefficient: 1 },
            { matiere: 'Algorithmique', type: 'Examen', note: 14, coefficient: 2 },
          ],
        },
        {
          semestre: 'L2-S1',
          moyenne: 13.33,
          lignes: [
            { matiere: 'Bases de données', type: 'TP', note: 15, coefficient: 1 },
            { matiere: 'Bases de données', type: 'Examen', note: 12.5, coefficient: 2 },
          ],
        },
        {
          semestre: 'L3-S1',
          moyenne: 15.33,
          lignes: [
            { matiere: 'Programmation Web', type: 'CC', note: 14, coefficient: 1 },
            { matiere: 'Programmation Web', type: 'Examen', note: 16, coefficient: 2 },
          ],
        },
      ],
    },
    'korka-bal': {
      enfant: {
        id: 'korka-bal',
        nom: 'Korka BAL',
        filiere: 'L3 GL',
        semestreCourant: 'L3-S1',
      },
      semestres: [
        {
          semestre: 'L3-S1',
          moyenne: 12.5,
          lignes: [
            { matiere: 'Programmation Web', type: 'CC', note: 12, coefficient: 1 },
            { matiere: 'Programmation Web', type: 'Examen', note: 13, coefficient: 2 },
          ],
        },
      ],
    },
  };

  listerEnfants(): Observable<Enfant[]> {
    const enfants = Object.values(this.dossiers).map((d) => d.enfant);
    return of(enfants).pipe(delay(400));
  }

  getDossier(enfantId: string): Observable<DossierEnfant> {
    return of(this.dossiers[enfantId]).pipe(delay(400));
  }
}