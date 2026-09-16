import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminData } from '../../core/admin-data';
import { CompteUtilisateur } from '../../core/models/admin.model';

@Component({
  selector: 'app-espace-admin',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './espace-admin.html',
  styleUrl: './espace-admin.scss',
})
export class EspaceAdmin {
  protected readonly data = inject(AdminData);

  protected readonly roles = this.data.roles;
  protected readonly recherche = signal('');
  protected readonly roleFiltre = signal('Tous les rôles');

  protected readonly comptesFiltres = computed(() => {
    const texte = this.recherche().toLowerCase().trim();
    const role = this.roleFiltre();
    return this.data.comptes().filter((c) => {
      const matchRole = role === 'Tous les rôles' || c.role === role;
      const matchTexte =
        !texte || c.nom.toLowerCase().includes(texte) || c.email.toLowerCase().includes(texte);
      return matchRole && matchTexte;
    });
  });

  protected readonly repartitionRoles = computed(() => {
    const comptage = new Map<string, number>();
    for (const c of this.data.comptes()) {
      comptage.set(c.role, (comptage.get(c.role) ?? 0) + 1);
    }
    return Array.from(comptage.entries()).map(([role, count]) => ({ role, count }));
  });

  // Stats fixes (mock, non lie aux autres services pour l'instant)
  protected readonly totalNotes = 10;
  protected readonly totalReclamations = 0;

  // Formulaire "Nouveau compte"
  protected readonly formulaireOuvert = signal(false);
  protected nouveauNom = '';
  protected nouvelEmail = '';
  protected nouveauRole = this.roles[1]; // Étudiant par defaut
  protected nouveauxDetails = '';

  // Edition inline d'un compte existant
  protected readonly compteEnEdition = signal<string | null>(null);
  protected nomEdite = '';
  protected roleEdite = '';
  protected detailsEdites = '';

  // Feedback temporaire apres reinitialisation de mot de passe
  protected readonly compteReinitialise = signal<string | null>(null);

  protected basculerFormulaire(): void {
    this.formulaireOuvert.update((v) => !v);
  }

  protected creerCompte(): void {
    if (!this.nouveauNom.trim() || !this.nouvelEmail.trim()) return;

    this.data.creerCompte({
      nom: this.nouveauNom.trim(),
      email: this.nouvelEmail.trim(),
      role: this.nouveauRole,
      details: this.nouveauxDetails.trim() || '—',
    });

    this.nouveauNom = '';
    this.nouvelEmail = '';
    this.nouveauxDetails = '';
    this.formulaireOuvert.set(false);
  }

  protected ouvrirEdition(compte: CompteUtilisateur): void {
    this.compteEnEdition.set(compte.id);
    this.nomEdite = compte.nom;
    this.roleEdite = compte.role;
    this.detailsEdites = compte.details;
  }

  protected annulerEdition(): void {
    this.compteEnEdition.set(null);
  }

  protected enregistrerEdition(id: string): void {
    this.data.modifierCompte(id, this.nomEdite, this.roleEdite, this.detailsEdites);
    this.compteEnEdition.set(null);
  }

  protected supprimerCompte(compte: CompteUtilisateur): void {
    if (!compte.peutSupprimer) return;
    if (!confirm(`Supprimer le compte de ${compte.nom} ?`)) return;
    this.data.supprimerCompte(compte.id);
  }

  protected reinitialiserMotDePasse(compte: CompteUtilisateur): void {
    this.data.reinitialiserMotDePasse(compte.id);
    this.compteReinitialise.set(compte.id);
    setTimeout(() => {
      if (this.compteReinitialise() === compte.id) {
        this.compteReinitialise.set(null);
      }
    }, 2000);
  }

  protected purgerJournal(): void {
    if (!confirm('Purger tout le journal d’audit ? Cette action est irréversible.')) return;
    this.data.purgerJournal();
  }
}