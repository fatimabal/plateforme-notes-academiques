import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-espace-parent',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './espace-parent.html',
styleUrl: '../espace-scolarite/espace-scolarite.scss',})
export class EspaceParent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api';

  protected readonly nomParent = `${localStorage.getItem('prenom') ?? ''} ${localStorage.getItem('nom') ?? ''}`.trim() || 'Parent';

  protected readonly notes = signal<any[]>([]);
  protected readonly bulletins = signal<any[]>([]);

  protected readonly moyenneGenerale = computed(() => {
    const n = this.notes();
    if (!n.length) return 0;
    const total = n.reduce((s, note) => s + (note.valeur ?? 0), 0);
    return Math.round((total / n.length) * 100) / 100;
  });

  ngOnInit(): void {
    this.chargerNotes();
    this.chargerBulletins();
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  private chargerNotes(): void {
    this.http.get<any>(`${this.apiUrl}/notes/enfant`, { headers: this.headers() })
      .subscribe({
        next: (d) => {
          const liste = Array.isArray(d) ? d : (d.data ?? d.notes ?? []);
          this.notes.set(liste);
        },
        error: () => {}
      });
  }

  private chargerBulletins(): void {
    this.http.get<any>(`${this.apiUrl}/bulletins/enfant`, { headers: this.headers() })
      .subscribe({
        next: (d) => {
          const liste = Array.isArray(d) ? d : (d.data ?? d.bulletins ?? []);
          this.bulletins.set(liste);
        },
        error: () => {}
      });
  }
}