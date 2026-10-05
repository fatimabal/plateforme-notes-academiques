import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminData {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Créer un utilisateur
  creerUtilisateur(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user, {
      headers: this.getHeaders()
    });
  }

  // Lister les utilisateurs
  getUtilisateurs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`, {
      headers: this.getHeaders()
    });
  }

  // Gérer les départements
  getDepartements(): Observable<any> {
    return this.http.get(`${this.apiUrl}/departements`, {
      headers: this.getHeaders()
    });
  }

  // Gérer les filières
  getFilieres(): Observable<any> {
    return this.http.get(`${this.apiUrl}/filieres`, {
      headers: this.getHeaders()
    });
  }
}