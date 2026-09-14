import { Injectable, computed, signal } from '@angular/core';
import { DossierFinancier } from './models/comptabilite.model';

/**
 * Donnees mockees pour l'espace comptabilite, en attendant le backend.
 *
 * TODO (integration backend) :
 *  - GET /api/comptabilite/dossiers -> DossierFinancier[]
 *  - PATCH /api/comptabilite/dossiers/{id} { montantEncaisse }
 *      (implemente Comptabilite#reglerSituation() et
 *       SituationFinanciere#verifierSituation() du diagramme de classes)
 */
@Injectable({ providedIn: 'root' })
export class ComptabiliteData {
  private readonly dossiersSignal = signal<DossierFinancier[]>([
    { id: crypto.randomUUID(), etudiant: 'Khady DIOP', classe: 'L3 GL', frais: 2500, paye: 212500 },
    { id: crypto.randomUUID(), etudiant: 'Korka BAL', classe: 'L1 GL', frais: 2500, paye: 1000 },
    { id: crypto.randomUUID(), etudiant: 'Yande GUISSE', classe: 'L2 GL', frais: 2500, paye: 0 },
  ]);

  readonly dossiers = this.dossiersSignal.asReadonly();

  readonly totalEncaisse = computed(() =>
    this.dossiersSignal().reduce((somme, d) => somme + d.paye, 0)
  );

  readonly totalAttendu = computed(() =>
    this.dossiersSignal().reduce((somme, d) => somme + d.frais, 0)
  );

  readonly nombreAJour = computed(
    () => this.dossiersSignal().filter((d) => d.paye >= d.frais).length
  );

  readonly nombreImpayes = computed(
    () => this.dossiersSignal().filter((d) => d.paye < d.frais).length
  );

  encaisser(id: string, montant: number): void {
    this.dossiersSignal.update((liste) =>
      liste.map((d) => (d.id === id ? { ...d, paye: d.paye + montant } : d))
    );
  }
}