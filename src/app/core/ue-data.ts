import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class UeData {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getAll(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ues`, { headers: this.getHeaders() });
  }

  create(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ues`, data, { headers: this.getHeaders() });
  }
}