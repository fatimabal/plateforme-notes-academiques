import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-espace-scolarite',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './espace-scolarite.html',
  styleUrl: './espace-scolarite.scss',
})
export class EspaceScolarite implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api';
  protected readonly notif = inject(NotificationService);
  protected afficherNotifs = signal(false);

  protected readonly nomScolarite = `${localStorage.getItem('prenom') ?? ''} ${localStorage.getItem('nom') ?? ''}`.trim() || 'Scolarité';

  protected readonly ongletActif = signal<'inscriptions' | 'notes' | 'reclamations' | 'bulletins'>('inscriptions');

  //  Inscriptions 
  protected readonly inscriptions = signal<any[]>([]);
  protected readonly etudiants = signal<any[]>([]);
  protected readonly classes = signal<any[]>([]);
  protected nouvelEtudiantId: number | null = null;
  protected nouvelleClasseId: number | null = null;
  protected nouvelleAnnee = new Date().getFullYear().toString();

  //  Notes 
  protected readonly notes = signal<any[]>([]);
  protected readonly filtreStatut = signal<string>('tous');
  protected readonly notesFiltrees = computed(() => {
    const f = this.filtreStatut();
    return f === 'tous' ? this.notes() : this.notes().filter(n => n.statut === f);
  });

  //  Réclamations 
  protected readonly reclamations = signal<any[]>([]);

  //  Bulletins 
  protected readonly bulletins = signal<any[]>([]);
  protected bulletinEtudiantId: number | null = null;
  protected bulletinSemestreId: number | null = null;
  protected readonly semestres = signal<any[]>([]);

  ngOnInit(): void {
    this.notif.charger();
    this.chargerInscriptions();
    this.chargerEtudiants();
    this.chargerClasses();
    this.chargerNotes();
    this.chargerReclamations();
    this.chargerSemestres();
    this.chargerBulletins();
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  private chargerInscriptions(): void {
  this.http.get<any>(`${this.apiUrl}/inscriptions`, { headers: this.headers() })
    .subscribe({ 
      next: (d) => {
        const liste = Array.isArray(d) ? d : (d.data ?? d.inscriptions ?? []);
        this.inscriptions.set(liste);
      }, 
      error: () => {} 
    });
}

  private chargerEtudiants(): void {
  this.http.get<any>(`${this.apiUrl}/etudiants`, { headers: this.headers() })
    .subscribe({ 
      next: (d) => {
        const liste = Array.isArray(d) ? d : (d.data ?? d.etudiants ?? d.users ?? []);
        this.etudiants.set(liste);
      }, 
      error: () => {} 
    });
}

  private chargerClasses(): void {
    this.http.get<any[]>(`${this.apiUrl}/classes`, { headers: this.headers() })
      .subscribe({ next: (d) => this.classes.set(d), error: () => {} });
  }

  private chargerNotes(): void {
    this.http.get<any[]>(`${this.apiUrl}/notes/toutes`, { headers: this.headers() })
      .subscribe({ next: (d) => this.notes.set(Array.isArray(d) ? d : []), error: () => {} });
  }

  private chargerReclamations(): void {
    this.http.get<any[]>(`${this.apiUrl}/reclamations`, { headers: this.headers() })
      .subscribe({ next: (d) => this.reclamations.set(Array.isArray(d) ? d : []), error: () => {} });
  }

  private chargerSemestres(): void {
    this.http.get<any[]>(`${this.apiUrl}/semestres`, { headers: this.headers() })
      .subscribe({ next: (d) => this.semestres.set(d), error: () => {} });
  }

  private chargerBulletins(): void {
    this.http.get<any[]>(`${this.apiUrl}/bulletins`, { headers: this.headers() })
      .subscribe({ next: (d) => this.bulletins.set(Array.isArray(d) ? d : []), error: () => {} });
  }

  //  Actions 
  protected inscrireEtudiant(): void {
    if (!this.nouvelEtudiantId || !this.nouvelleClasseId) return;
    this.http.post(`${this.apiUrl}/inscriptions`, {
      etudiant_id: this.nouvelEtudiantId,
      classe_id: this.nouvelleClasseId,
      annee_academique: this.nouvelleAnnee,
    }, { headers: this.headers() }).subscribe({ next: () => this.chargerInscriptions(), error: () => {} });
  }

  protected validerNote(id: number): void {
    this.http.put(`${this.apiUrl}/notes/${id}/valider`, {}, { headers: this.headers() })
      .subscribe({ next: () => this.chargerNotes(), error: () => {} });
  }

  protected relancerReclamation(id: number): void {
    this.http.put(`${this.apiUrl}/reclamations/${id}/relancer`, {}, { headers: this.headers() })
      .subscribe({ next: () => this.chargerReclamations(), error: () => {} });
  }

  protected genererBulletin(): void {
    if (!this.bulletinEtudiantId || !this.bulletinSemestreId) return;
    this.http.post(`${this.apiUrl}/bulletins`, {
      etudiant_id: this.bulletinEtudiantId,
      semestre_id: this.bulletinSemestreId,
    }, { headers: this.headers() }).subscribe({ next: () => this.chargerBulletins(), error: () => {} });
  }
}