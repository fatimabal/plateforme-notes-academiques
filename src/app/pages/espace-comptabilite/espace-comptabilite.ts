import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-espace-comptabilite',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './espace-comptabilite.html',
  styleUrl: './espace-comptabilite.scss',
})
export class EspaceComptabilite implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api';

  protected readonly nomActeur = `${localStorage.getItem('prenom') ?? ''} ${localStorage.getItem('nom') ?? ''}`.trim() || 'Comptabilité';

  protected readonly dossiers = signal<any[]>([]);
  protected readonly etudiants = signal<any[]>([]);

  protected readonly nbAJour = computed(() => this.dossiers().filter(d => d.estAJour).length);
  protected readonly nbImpayes = computed(() => this.dossiers().filter(d => !d.estAJour).length);

  // Formulaire création
  protected formulaireOuvert = signal(false);
  protected nouvelEtudiantId: number | null = null;
  protected nouvelleDate = new Date().toISOString().split('T')[0];
  protected nouveauStatut = false;

  ngOnInit(): void {
    this.chargerDossiers();
    this.chargerEtudiants();
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  private chargerDossiers(): void {
    this.http.get<any>(`${this.apiUrl}/situations-financieres`, { headers: this.headers() })
      .subscribe({
        next: (d) => {
          const liste = Array.isArray(d) ? d : (d.data ?? d.situations ?? []);
          this.dossiers.set(liste);
        },
        error: () => {}
      });
  }

  private chargerEtudiants(): void {
this.http.get<any>(`${this.apiUrl}/etudiants-liste`, { headers: this.headers() })    .subscribe({
      next: (d) => {
        const liste = Array.isArray(d) ? d : (d.data ?? d.etudiants ?? []);
        this.etudiants.set(liste);
      },
      error: () => {}
    });
}

  protected creerDossier(): void {
    if (!this.nouvelEtudiantId) return;
    this.http.post(`${this.apiUrl}/situations-financieres`, {
      etudiant_id: this.nouvelEtudiantId,
      estAJour: this.nouveauStatut,
      dateVerification: this.nouvelleDate,
    }, { headers: this.headers() }).subscribe({
      next: () => {
        this.formulaireOuvert.set(false);
        this.nouvelEtudiantId = null;
        this.chargerDossiers();
      },
      error: () => {}
    });
  }

  protected regulariser(d: any): void {
    this.http.put(`${this.apiUrl}/situations-financieres/${d.id}/regulariser`, {}, { headers: this.headers() })
      .subscribe({ next: () => this.chargerDossiers(), error: () => {} });
  }

  protected reset(): void {
    this.chargerDossiers();
  }
  protected rechercheEtudiant = '';
protected readonly etudiantsFiltres = computed(() => {
  const q = this.rechercheEtudiant.toLowerCase();
  if (!q) return this.etudiants();
  return this.etudiants().filter(e =>
    (e.user?.nom + ' ' + e.user?.prenom + ' ' + e.matricule).toLowerCase().includes(q)
  );
});
}