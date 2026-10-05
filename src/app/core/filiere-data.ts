import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class FiliereData {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getAll(): Observable<any> {
    return this.http.get(`${this.apiUrl}/filieres`, { headers: this.getHeaders() });
  }

  create(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/filieres`, data, { headers: this.getHeaders() });
  }
}