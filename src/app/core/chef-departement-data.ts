import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChefDepartementData {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Récupérer les départements
  getDepartements(): Observable<any> {
    return this.http.get(`${this.apiUrl}/departements`, {
      headers: this.getHeaders()
    });
  }

  // Récupérer les filières
  getFilieres(): Observable<any> {
    return this.http.get(`${this.apiUrl}/filieres`, {
      headers: this.getHeaders()
    });
  }

  // Récupérer les classes
  getClasses(): Observable<any> {
    return this.http.get(`${this.apiUrl}/classes`, {
      headers: this.getHeaders()
    });
  }

  // Récupérer les enseignants
  getEnseignants(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`, {
      headers: this.getHeaders()
    });
  }
}