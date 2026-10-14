import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = 'http://localhost:8000/api';
  notifications = signal<any[]>([]);
  nonLues = signal<number>(0);

  constructor(private http: HttpClient) {}

  charger() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any[]>(`${this.apiUrl}/notifications`, { headers }).subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.nonLues.set(data.filter((n: any) => !n.read_at).length);
      },
      error: () => {}
    });
  }

  marquerLues() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.post(`${this.apiUrl}/notifications/lues`, {}, { headers }).subscribe({
      next: () => this.nonLues.set(0)
    });
  }
}