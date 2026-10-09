import { Injectable, computed, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ComptabiliteData {
  readonly dossiers = signal([
    { id: 1, etudiant: 'Alice Yaya', classe: 'L3 GL', frais: 350000, paye: 270000 },
    { id: 2, etudiant: 'Brahim Diallo', classe: 'L2 SI', frais: 350000, paye: 350000 },
    { id: 3, etudiant: 'Sonia Koffi', classe: 'L3 SI', frais: 350000, paye: 310000 }
  ]);

  readonly totalEncaisse = computed(() => this.dossiers().reduce((sum, dossier) => sum + dossier.paye, 0));
  readonly totalAttendu = computed(() => this.dossiers().reduce((sum, dossier) => sum + dossier.frais, 0));
  readonly nombreAJour = computed(() => this.dossiers().filter((dossier) => dossier.paye >= dossier.frais).length);
  readonly nombreImpayes = computed(() => this.dossiers().filter((dossier) => dossier.paye < dossier.frais).length);

  getSituationsFinancieres(): Observable<any> {
    return of(this.dossiers());
  }

  encaisser(etudiantId: number, montant: number): Observable<any> {
    this.dossiers.update((liste) => liste.map((d) => {
      if (d.id !== etudiantId) return d;
      return { ...d, paye: Math.min(d.frais, d.paye + montant) };
    }));
    return of({ success: true, etudiantId, montant });
  }
}
