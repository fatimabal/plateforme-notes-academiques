import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class EnseignantData {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Saisir une note
  saisirNote(note: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/notes`, note, {
      headers: this.getHeaders()
    });
  }

  // Modifier une note
  modifierNote(noteId: number, valeur: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/notes/${noteId}`, { valeur }, {
      headers: this.getHeaders()
    });
  }

  // Consulter les évaluations
  getEvaluations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/evaluations`, {
      headers: this.getHeaders()
    });
  }
}