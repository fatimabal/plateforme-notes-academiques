import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-espace-chef-departement',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './espace-chef-departement.html',
  styleUrl: './espace-chef-departement.scss',
})
export class EspaceChefDepartement implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api';
  protected readonly notif = inject(NotificationService);
  protected afficherNotifs = signal(false);

  protected readonly nomChef = localStorage.getItem('nom') ?? 'Chef Département';
  protected readonly onglets = ['Notes', 'Réclamations', 'Délibérations'];
  protected readonly ongletActif = signal('Notes');

  protected readonly notes = signal<any[]>([]);
  protected readonly reclamations = signal<any[]>([]);
  protected readonly deliberations = signal<any[]>([]);
  protected readonly classes = signal<any[]>([]);
  protected readonly semestres = signal<any[]>([]);

  protected champClasseId: number | null = null;
  protected champSemestreId: number | null = null;
  protected messageSucces = '';

  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  ngOnInit(): void {
    this.notif.charger();
    this.chargerNotes();
    this.chargerReclamations();
    this.chargerDeliberations();
    this.chargerClasses();
    this.chargerSemestres();
  }

  private chargerNotes(): void {
    this.http.get<any[]>(`${this.apiUrl}/notes/toutes`, { headers: this.headers }).subscribe({
      next: (data) => this.notes.set(Array.isArray(data) ? data : []),
      error: () => this.notes.set([])
    });
  }

  private chargerReclamations(): void {
    this.http.get<any[]>(`${this.apiUrl}/reclamations`, { headers: this.headers }).subscribe({
      next: (data) => this.reclamations.set(Array.isArray(data) ? data : []),
      error: () => this.reclamations.set([])
    });
  }

  private chargerDeliberations(): void {
    this.http.get<any[]>(`${this.apiUrl}/deliberations`, { headers: this.headers }).subscribe({
      next: (data) => this.deliberations.set(Array.isArray(data) ? data : []),
      error: () => this.deliberations.set([])
    });
  }

  private chargerClasses(): void {
    this.http.get<any[]>(`${this.apiUrl}/classes`, { headers: this.headers }).subscribe({
      next: (data) => this.classes.set(Array.isArray(data) ? data : []),
      error: () => this.classes.set([])
    });
  }

  private chargerSemestres(): void {
    this.http.get<any[]>(`${this.apiUrl}/semestres`, { headers: this.headers }).subscribe({
      next: (data) => this.semestres.set(Array.isArray(data) ? data : []),
      error: () => this.semestres.set([])
    });
  }

  protected relancerReclamation(id: number): void {
    this.http.put(`${this.apiUrl}/reclamations/${id}/relancer`, {}, { headers: this.headers }).subscribe({
      next: () => {
        this.messageSucces = 'Réclamation relancée avec succès.';
        this.chargerReclamations();
        setTimeout(() => (this.messageSucces = ''), 3000);
      },
      error: (err) => console.error('Erreur relance:', err)
    });
  }

  protected validerDeliberation(): void {
    if (!this.champClasseId || !this.champSemestreId) return;
    this.http.post(`${this.apiUrl}/deliberations/valider`, {
      classe_id: this.champClasseId,
      semestre_id: this.champSemestreId
    }, { headers: this.headers }).subscribe({
      next: () => {
        this.messageSucces = 'Délibération validée avec succès.';
        this.champClasseId = null;
        this.champSemestreId = null;
        this.chargerDeliberations();
        setTimeout(() => (this.messageSucces = ''), 3000);
      },
      error: (err) => console.error('Erreur validation:', err)
    });
  }
}