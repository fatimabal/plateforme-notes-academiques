import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import type { Commentaire, DossierEnfant, Enfant } from './models/parent.model';

@Injectable({ providedIn: 'root' })
export class ParentData {
  private readonly enfants: Enfant[] = [
    { id: 'e1', nom: 'Alice Yaya', filiere: 'GL', semestreCourant: 'L3-S1' },
    { id: 'e2', nom: 'Brahim Diallo', filiere: 'SI', semestreCourant: 'L2-S2' }
  ];

  private readonly dossiers: Record<string, DossierEnfant> = {
    e1: {
      enfant: this.enfants[0],
      semestres: [
        { semestre: 'L1-S1', moyenne: 12.8, lignes: [{ matiere: 'Algorithmique', type: 'CC', note: 13.5, coefficient: 2 }, { matiere: 'Math?matiques', type: 'Examen', note: 12.2, coefficient: 3 }] },
        { semestre: 'L1-S2', moyenne: 13.6, lignes: [{ matiere: 'Base de donn?es', type: 'TP', note: 14.2, coefficient: 2 }, { matiere: 'Programmation', type: 'Examen', note: 13.1, coefficient: 3 }] },
        { semestre: 'L2-S1', moyenne: 14.1, lignes: [{ matiere: 'Java', type: 'CC', note: 14.4, coefficient: 2 }, { matiere: 'UML', type: 'Examen', note: 13.8, coefficient: 3 }] },
        { semestre: 'L2-S2', moyenne: 14.7, lignes: [{ matiere: 'Web', type: 'Projet', note: 15.2, coefficient: 3 }, { matiere: 'BD', type: 'Examen', note: 14.3, coefficient: 3 }] }
      ]
    },
    e2: {
      enfant: this.enfants[1],
      semestres: [
        { semestre: 'L1-S1', moyenne: 11.9, lignes: [{ matiere: 'Algorithmique', type: 'CC', note: 12.0, coefficient: 2 }, { matiere: 'Math?matiques', type: 'Examen', note: 11.8, coefficient: 3 }] },
        { semestre: 'L1-S2', moyenne: 12.6, lignes: [{ matiere: 'Base de donn?es', type: 'TP', note: 13.1, coefficient: 2 }, { matiere: 'Programmation', type: 'Examen', note: 12.3, coefficient: 3 }] },
        { semestre: 'L2-S1', moyenne: 13.4, lignes: [{ matiere: 'Java', type: 'CC', note: 13.9, coefficient: 2 }, { matiere: 'UML', type: 'Examen', note: 12.9, coefficient: 3 }] }
      ]
    }
  };

  listerEnfants(): Observable<Enfant[]> {
    return of(this.enfants);
  }

  getDossier(id: string): Observable<DossierEnfant> {
    return of(this.dossiers[id] ?? this.dossiers['e1']);
  }

  getNotes(): Observable<any> {
    return of([]);
  }

  getBulletins(): Observable<any> {
    return of([]);
  }

  publierCommentaire(id: string, texte: string): Observable<Commentaire> {
    return of({ id, texte, date: new Date() });
  }
}
