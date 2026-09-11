import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DemandeInscription } from './models/utilisateur.model';

@Injectable({ providedIn: 'root' })
export class InscriptionApi {
  creerCompte(demande: DemandeInscription): Observable<{ statut: 'enAttente' }> {
    return of({ statut: 'enAttente' as const }).pipe(delay(700));
  }
}