import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EtudiantData } from '../../core/etudiant-data';
import { ProfilEtudiant } from '../../core/models/etudiant.model';

@Component({
  selector: 'app-espace-etudiant',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './espace-etudiant.html',
  styleUrl: './espace-etudiant.scss',
})
export class EspaceEtudiant {
  private readonly etudiantData = inject(EtudiantData);

  protected readonly profil = signal<ProfilEtudiant | null>(null);
  protected readonly semestreSelectionneCode = signal<string | null>(null);

  protected readonly semestreAffiche = computed(() => {
    const p = this.profil();
    if (!p) return null;
    return p.semestres.find((s) => s.code === this.semestreSelectionneCode()) ?? null;
  });

  // Cle de la ligne dont le formulaire de reclamation est ouvert (ex. "Programmation Web|CC")
  protected readonly reclamationOuverte = signal<string | null>(null);
  protected motifReclamation = '';
  protected readonly reclamationsEnvoyees = signal<Set<string>>(new Set());

  constructor() {
    this.etudiantData.getProfil().subscribe((profil) => {
      this.profil.set(profil);
      const actuel = profil.semestres.find((s) => s.actuel);
      this.semestreSelectionneCode.set(actuel?.code ?? profil.semestres[0]?.code ?? null);
    });
  }

  protected selectionnerSemestre(code: string): void {
    this.semestreSelectionneCode.set(code);
    this.reclamationOuverte.set(null);
  }

  protected cleLigne(matiere: string, type: string): string {
    return `${matiere}|${type}`;
  }

  protected ouvrirReclamation(matiere: string, type: string): void {
    this.reclamationOuverte.set(this.cleLigne(matiere, type));
    this.motifReclamation = '';
  }

  protected annulerReclamation(): void {
    this.reclamationOuverte.set(null);
  }

  protected envoyerReclamation(matiere: string, type: string): void {
    if (!this.motifReclamation.trim()) return;

    // TODO : appeler ici Reclamation#transmettre() via un service reel.
    this.reclamationsEnvoyees.update((set) => {
      const copie = new Set(set);
      copie.add(this.cleLigne(matiere, type));
      return copie;
    });
    this.reclamationOuverte.set(null);
  }

  protected estReclamee(matiere: string, type: string): boolean {
    return this.reclamationsEnvoyees().has(this.cleLigne(matiere, type));
  }

  protected reinitialiser(): void {
    const p = this.profil();
    const actuel = p?.semestres.find((s) => s.actuel);
    if (actuel) this.semestreSelectionneCode.set(actuel.code);
    this.reclamationOuverte.set(null);
  }
}