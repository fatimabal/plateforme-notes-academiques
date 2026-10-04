import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExamensData {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }


  // Récupérer tous les semestres
  getSemestres(): Observable<any> {
    return this.http.get(`${this.apiUrl}/semestres`, {
      headers: this.getHeaders()
    });
  }

  // Récupérer les notes validées
  getNotes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notes`, {
      headers: this.getHeaders()
    });
  }

  // Valider une note (délibération)
  validerNote(noteId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/notes/${noteId}/valider`, {}, {
      headers: this.getHeaders()
    });
  }

  // Générer un bulletin
  genererBulletin(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulletins`, data, {
      headers: this.getHeaders()
    });
  }
}