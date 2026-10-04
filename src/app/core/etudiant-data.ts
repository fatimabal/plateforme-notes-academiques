import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class EtudiantData {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Récupérer les notes de l'étudiant connecté
  getNotes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notes`, {
      headers: this.getHeaders()
    });
  }

  // Récupérer les bulletins de l'étudiant connecté
  getBulletins(): Observable<any> {
    return this.http.get(`${this.apiUrl}/bulletins`, {
      headers: this.getHeaders()
    });
  }

  // Soumettre une réclamation
  soumettrReclamation(noteId: number, motif: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reclamations`, {
      note_id: noteId,
      motif: motif,
      etudiant_id: localStorage.getItem('user_id')
    }, {
      headers: this.getHeaders()
    });
  }
}