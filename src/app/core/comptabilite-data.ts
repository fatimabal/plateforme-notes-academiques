import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ComptabiliteData {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Récupérer toutes les situations financières
  getSituationsFinancieres(): Observable<any> {
    return this.http.get(`${this.apiUrl}/situations-financieres`, {
      headers: this.getHeaders()
    });
  }

  // Mettre à jour la situation financière d'un étudiant
  mettreAJour(etudiantId: number, estAJour: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/situations-financieres`, {
      etudiant_id: etudiantId,
      estAJour: estAJour,
      dateVerification: new Date().toISOString().split('T')[0]
    }, {
      headers: this.getHeaders()
    });
  }
}