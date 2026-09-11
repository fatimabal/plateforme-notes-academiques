import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ParentData } from '../../core/parent-data';
import { Commentaire, DossierEnfant, Enfant } from '../../core/models/parent.model';

@Component({
  selector: 'app-espace-parent',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './espace-parent.html',
  styleUrl: './espace-parent.scss',
})
export class EspaceParent {
  private readonly parentData = inject(ParentData);

  protected readonly nomParent = 'Mme BAL';

  protected readonly enfants = signal<Enfant[]>([]);
  protected readonly enfantSelectionneId = signal<string | null>(null);
  protected readonly dossier = signal<DossierEnfant | null>(null);

  protected nouveauCommentaire = '';
  protected readonly commentaires = signal<Commentaire[]>([]);

  protected readonly evolution = computed(() => {
    const semestres = this.dossier()?.semestres ?? [];
    if (semestres.length < 2) return null;

    const avantDernier = semestres[semestres.length - 2];
    const dernier = semestres[semestres.length - 1];
    const delta = Math.round((dernier.moyenne - avantDernier.moyenne) * 100) / 100;

    return { delta, de: avantDernier.semestre, vers: dernier.semestre };
  });

  constructor() {
    this.parentData.listerEnfants().subscribe((enfants) => {
      this.enfants.set(enfants);
      if (enfants.length > 0) {
        this.selectionnerEnfant(enfants[0].id);
      }
    });
  }

  protected selectionnerEnfant(id: string): void {
    this.enfantSelectionneId.set(id);
    this.commentaires.set([]);
    this.parentData.getDossier(id).subscribe((dossier) => {
      this.dossier.set(dossier);
    });
  }

  protected largeurBarre(moyenne: number): number {
    return Math.max(0, Math.min(100, (moyenne / 20) * 100));
  }

  protected publierCommentaire(): void {
    const texte = this.nouveauCommentaire.trim();
    if (!texte) return;

    this.commentaires.update((liste) => [
      ...liste,
      { id: crypto.randomUUID(), texte, date: new Date() },
    ]);
    this.nouveauCommentaire = '';
  }

  protected reinitialiser(): void {
    if (this.enfants().length > 0) {
      this.selectionnerEnfant(this.enfants()[0].id);
    }
  }
}