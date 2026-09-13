import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ProfilEtudiant } from './models/etudiant.model';

/**
 * Donnees mockees pour l'espace etudiant, en attendant le backend.
 *
 * TODO (integration backend) :
 *  - GET /api/etudiants/moi -> ProfilEtudiant
 *  - POST /api/reclamations { note, motif } -> Reclamation
 *      (implemente Etudiant#reclamerNote() du diagramme de classes)
 */
@Injectable({ providedIn: 'root' })
export class EtudiantData {
  private readonly profil: ProfilEtudiant = {
    nom: 'Étudiant Démo',
    classe: 'L3 GL',
    semestres: [
      { code: 'L1-S1', label: 'L1-S1', actuel: false, moyenne: 13.67, modules: [
        { matiere: 'Algorithmique', moyenne: 13.67, evaluations: [
          { type: 'CC', note: 13, coefficient: 1, date: '2023-11-10' },
          { type: 'Examen', note: 14, coefficient: 2, date: '2024-01-15' },
        ]},
      ]},
      { code: 'L1-S2', label: 'L1-S2', actuel: false, moyenne: null, modules: [] },
      { code: 'L2-S1', label: 'L2-S1', actuel: false, moyenne: 13.33, modules: [
        { matiere: 'Bases de données', moyenne: 13.33, evaluations: [
          { type: 'TP', note: 15, coefficient: 1, date: '2024-11-05' },
          { type: 'Examen', note: 12.5, coefficient: 2, date: '2025-01-14' },
        ]},
      ]},
      { code: 'L2-S2', label: 'L2-S2', actuel: false, moyenne: null, modules: [] },
      { code: 'L3-S1', label: 'L3-S1 · actuel', actuel: true, moyenne: 15.33, modules: [
        { matiere: 'Programmation Web', moyenne: 15.33, evaluations: [
          { type: 'CC', note: 14, coefficient: 1, date: '2025-03-02' },
          { type: 'Examen', note: 16, coefficient: 2, date: '2025-05-20' },
        ]},
      ]},
    ],
  };

  getProfil(): Observable<ProfilEtudiant> {
    return of(this.profil).pipe(delay(400));
  }
}