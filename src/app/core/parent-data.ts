import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ParentData {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Consulter les notes de l'enfant
  getNotes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notes`, {
      headers: this.getHeaders()
    });
  }

  // Consulter les bulletins de l'enfant
  getBulletins(): Observable<any> {
    return this.http.get(`${this.apiUrl}/bulletins`, {
      headers: this.getHeaders()
    });
  }
}