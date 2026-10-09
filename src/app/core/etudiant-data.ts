import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import type { ProfilEtudiant } from './models/etudiant.model';

@Injectable({ providedIn: 'root' })
export class EtudiantData {
  private readonly profil: ProfilEtudiant = {
    nom: 'Alice Yaya',
    classe: 'L3 GL',
    semestres: [
      {
        code: 'L1-S1',
        label: 'Semestre 1',
        actuel: false,
        moyenne: 12.8,
        modules: [
          { matiere: 'Algorithmique', moyenne: 13.5, evaluations: [{ type: 'CC', note: 13.5, coefficient: 2, date: '2025-01-15' }, { type: 'Examen', note: 12.1, coefficient: 3, date: '2025-02-05' }] },
          { matiere: 'Math?matiques', moyenne: 12.2, evaluations: [{ type: 'CC', note: 12.5, coefficient: 2, date: '2025-01-20' }, { type: 'Examen', note: 11.9, coefficient: 3, date: '2025-02-10' }] }
        ]
      },
      {
        code: 'L1-S2',
        label: 'Semestre 2',
        actuel: false,
        moyenne: 13.7,
        modules: [
          { matiere: 'Base de donn?es', moyenne: 14.2, evaluations: [{ type: 'TP', note: 14.2, coefficient: 2, date: '2025-06-20' }, { type: 'Examen', note: 13.2, coefficient: 3, date: '2025-07-01' }] },
          { matiere: 'Programmation', moyenne: 13.3, evaluations: [{ type: 'CC', note: 13.8, coefficient: 2, date: '2025-06-18' }, { type: 'Examen', note: 12.9, coefficient: 3, date: '2025-07-02' }] }
        ]
      },
      {
        code: 'L3-S1',
        label: 'Semestre actuel',
        actuel: true,
        moyenne: 15.4,
        modules: [
          { matiere: 'Architecture logicielle', moyenne: 15.9, evaluations: [{ type: 'Projet', note: 16.5, coefficient: 3, date: '2026-09-12' }, { type: 'Examen', note: 15.2, coefficient: 3, date: '2026-10-02' }] },
          { matiere: 'IA', moyenne: 14.9, evaluations: [{ type: 'CC', note: 14.7, coefficient: 2, date: '2026-09-18' }, { type: 'Examen', note: 15.1, coefficient: 3, date: '2026-10-03' }] }
        ]
      }
    ]
  };

  getProfil(): Observable<ProfilEtudiant> {
    return of(this.profil);
  }
}
