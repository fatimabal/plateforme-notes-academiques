import { Injectable, signal } from '@angular/core';
import { TableauBordPedagogique } from './models/chef-departement.model';

/**
 * Donnees mockees pour l'espace Chef de departement, en attendant le backend.
 *
 * TODO (integration backend) :
 *  - GET /api/chef-departement/tableau-bord?semestre=... -> TableauBordPedagogique
 *      (implemente ChefDeDepartement#consulterIndicateurs() du diagramme
 *       de classes)
 */
@Injectable({ providedIn: 'root' })
export class ChefDepartementData {
  readonly semestres = ['Tous', 'L1-S1', 'L1-S2', 'L2-S1', 'L2-S2', 'L3-S1', 'L3-S2'];

  private readonly tableauxSignal = signal<Record<string, TableauBordPedagogique>>({
    Tous: {
      tauxReussite: 100,
      etudiantsEvalues: 3,
      moyenneGenerale: 14.43,
      reclamationsTraitees: 0,
      reclamationsTotal: 0,
      moyennesParClasse: [
        { classe: 'L3 GL', etudiants: 1, moyenne: 14.44 },
        { classe: 'L1 GL', etudiants: 1, moyenne: 12.33 },
        { classe: 'L2 GL', etudiants: 1, moyenne: 16.5 },
      ],
      distribution: [
        { tranche: '0–5', count: 0 },
        { tranche: '5–10', count: 0 },
        { tranche: '10–12', count: 1 },
        { tranche: '12–14', count: 2 },
        { tranche: '14–16', count: 3 },
        { tranche: '16–20', count: 4 },
      ],
      moyennesParModule: [
        { module: 'Programmation Web', notes: 2, moyenne: 15.33 },
        { module: 'Algorithmique', notes: 5, moyenne: 14.0 },
        { module: 'Bases de données', notes: 3, moyenne: 14.0 },
      ],
    },
    'L1-S1': {
      tauxReussite: 100,
      etudiantsEvalues: 3,
      moyenneGenerale: 14.33,
      reclamationsTraitees: 0,
      reclamationsTotal: 0,
      moyennesParClasse: [
        { classe: 'L3 GL', etudiants: 1, moyenne: 13.67 },
        { classe: 'L1 GL', etudiants: 1, moyenne: 12.33 },
        { classe: 'L2 GL', etudiants: 1, moyenne: 17.0 },
      ],
      distribution: [
        { tranche: '0–5', count: 0 },
        { tranche: '5–10', count: 0 },
        { tranche: '10–12', count: 1 },
        { tranche: '12–14', count: 2 },
        { tranche: '14–16', count: 1 },
        { tranche: '16–20', count: 1 },
      ],
      moyennesParModule: [
        { module: 'Programmation Web', notes: 1, moyenne: 17.0 },
        { module: 'Algorithmique', notes: 2, moyenne: 13.67 },
        { module: 'Bases de données', notes: 2, moyenne: 12.33 },
      ],
    },
    'L1-S2': {
      tauxReussite: 100,
      etudiantsEvalues: 3,
      moyenneGenerale: 13.8,
      reclamationsTraitees: 0,
      reclamationsTotal: 0,
      moyennesParClasse: [
        { classe: 'L3 GL', etudiants: 1, moyenne: 13.2 },
        { classe: 'L1 GL', etudiants: 1, moyenne: 12.8 },
        { classe: 'L2 GL', etudiants: 1, moyenne: 15.4 },
      ],
      distribution: [
        { tranche: '0–5', count: 0 },
        { tranche: '5–10', count: 0 },
        { tranche: '10–12', count: 1 },
        { tranche: '12–14', count: 2 },
        { tranche: '14–16', count: 2 },
        { tranche: '16–20', count: 0 },
      ],
      moyennesParModule: [
        { module: 'Programmation Web', notes: 1, moyenne: 15.4 },
        { module: 'Algorithmique', notes: 2, moyenne: 13.2 },
        { module: 'Bases de données', notes: 2, moyenne: 12.8 },
      ],
    },
    'L2-S1': {
      tauxReussite: 100,
      etudiantsEvalues: 3,
      moyenneGenerale: 14.9,
      reclamationsTraitees: 0,
      reclamationsTotal: 0,
      moyennesParClasse: [
        { classe: 'L3 GL', etudiants: 1, moyenne: 14.7 },
        { classe: 'L1 GL', etudiants: 1, moyenne: 13.1 },
        { classe: 'L2 GL', etudiants: 1, moyenne: 16.9 },
      ],
      distribution: [
        { tranche: '0–5', count: 0 },
        { tranche: '5–10', count: 0 },
        { tranche: '10–12', count: 0 },
        { tranche: '12–14', count: 2 },
        { tranche: '14–16', count: 2 },
        { tranche: '16–20', count: 1 },
      ],
      moyennesParModule: [
        { module: 'Programmation Web', notes: 1, moyenne: 16.9 },
        { module: 'Algorithmique', notes: 2, moyenne: 14.7 },
        { module: 'Bases de données', notes: 2, moyenne: 13.1 },
      ],
    },
    'L2-S2': {
      tauxReussite: 100,
      etudiantsEvalues: 3,
      moyenneGenerale: 14.1,
      reclamationsTraitees: 0,
      reclamationsTotal: 0,
      moyennesParClasse: [
        { classe: 'L3 GL', etudiants: 1, moyenne: 13.9 },
        { classe: 'L1 GL', etudiants: 1, moyenne: 12.6 },
        { classe: 'L2 GL', etudiants: 1, moyenne: 15.8 },
      ],
      distribution: [
        { tranche: '0–5', count: 0 },
        { tranche: '5–10', count: 0 },
        { tranche: '10–12', count: 1 },
        { tranche: '12–14', count: 1 },
        { tranche: '14–16', count: 2 },
        { tranche: '16–20', count: 1 },
      ],
      moyennesParModule: [
        { module: 'Programmation Web', notes: 1, moyenne: 15.8 },
        { module: 'Algorithmique', notes: 2, moyenne: 13.9 },
        { module: 'Bases de données', notes: 2, moyenne: 12.6 },
      ],
    },
    'L3-S1': {
      tauxReussite: 100,
      etudiantsEvalues: 3,
      moyenneGenerale: 14.6,
      reclamationsTraitees: 0,
      reclamationsTotal: 0,
      moyennesParClasse: [
        { classe: 'L3 GL', etudiants: 1, moyenne: 15.33 },
        { classe: 'L1 GL', etudiants: 1, moyenne: 12.33 },
        { classe: 'L2 GL', etudiants: 1, moyenne: 16.0 },
      ],
      distribution: [
        { tranche: '0–5', count: 0 },
        { tranche: '5–10', count: 0 },
        { tranche: '10–12', count: 0 },
        { tranche: '12–14', count: 2 },
        { tranche: '14–16', count: 1 },
        { tranche: '16–20', count: 2 },
      ],
      moyennesParModule: [
        { module: 'Programmation Web', notes: 2, moyenne: 15.33 },
        { module: 'Algorithmique', notes: 2, moyenne: 12.33 },
        { module: 'Bases de données', notes: 1, moyenne: 16.0 },
      ],
    },
    'L3-S2': {
      tauxReussite: 100,
      etudiantsEvalues: 3,
      moyenneGenerale: 15.2,
      reclamationsTraitees: 0,
      reclamationsTotal: 0,
      moyennesParClasse: [
        { classe: 'L3 GL', etudiants: 1, moyenne: 15.0 },
        { classe: 'L1 GL', etudiants: 1, moyenne: 13.4 },
        { classe: 'L2 GL', etudiants: 1, moyenne: 17.2 },
      ],
      distribution: [
        { tranche: '0–5', count: 0 },
        { tranche: '5–10', count: 0 },
        { tranche: '10–12', count: 0 },
        { tranche: '12–14', count: 1 },
        { tranche: '14–16', count: 2 },
        { tranche: '16–20', count: 2 },
      ],
      moyennesParModule: [
        { module: 'Programmation Web', notes: 1, moyenne: 17.2 },
        { module: 'Algorithmique', notes: 2, moyenne: 15.0 },
        { module: 'Bases de données', notes: 2, moyenne: 13.4 },
      ],
    },
  });

  getTableauBord(semestre: string): TableauBordPedagogique | null {
    return this.tableauxSignal()[semestre] ?? null;
  }
}