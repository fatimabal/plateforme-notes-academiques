import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class InscriptionApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  creerCompte(demande: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, {
      nom: demande.nom,
      prenom: demande.prenom,
      email: demande.email,
      password: demande.motDePasse,
      role: demande.role,
      telephone: demande.telephone
    });
  }
}