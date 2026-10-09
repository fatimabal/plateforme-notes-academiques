import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import type { CompteUtilisateur, EntreeAudit } from './models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminData {
  readonly nomActeur = 'Admin ISI';
  readonly roles = ['Etudiant', 'Enseignant', 'Chef de d?partement', 'Responsable comptabilit?', 'Agent service examens'];

  readonly comptes = signal<CompteUtilisateur[]>([
    { id: 'u1', nom: 'Mouhamed Bah', email: 'm.bah@isi.edu', role: 'Etudiant', details: 'L3 Informatique', peutSupprimer: false },
    { id: 'u2', nom: 'Pr. Karim Mansour', email: 'k.mansour@isi.edu', role: 'Enseignant', details: 'D?partement Informatique', peutSupprimer: false },
    { id: 'u3', nom: 'Mme Fatima Diop', email: 'f.diop@isi.edu', role: 'Chef de d?partement', details: 'Direction p?dagogique', peutSupprimer: false },
    { id: 'u4', nom: 'M. Alain Koffi', email: 'a.koffi@isi.edu', role: 'Responsable comptabilit?', details: 'Suivi financier', peutSupprimer: false },
    { id: 'u5', nom: 'Mme Awa Sarr', email: 'a.sarr@isi.edu', role: 'Agent service examens', details: 'D?livrance r?sultats', peutSupprimer: false }
  ]);

  readonly journal = signal<EntreeAudit[]>([
    { id: 'audit-1', date: '2026-10-05', acteur: 'Syst?me', role: 'Administration', action: 'Initialisation', cible: 'Plateforme', details: 'Chargement des donn?es de d?monstration' }
  ]);

  getComptes(): Observable<CompteUtilisateur[]> {
    return of(this.comptes());
  }

  creerCompte(demande: Partial<CompteUtilisateur>): Observable<CompteUtilisateur> {
    const compte: CompteUtilisateur = {
      id: crypto.randomUUID(),
      nom: demande.nom ?? 'Compte',
      email: demande.email ?? 'inconnu@isi.edu',
      role: demande.role ?? 'Etudiant',
      details: demande.details ?? '?',
      peutSupprimer: true,
    };

    this.comptes.update((liste) => [compte, ...liste]);
    this.journal.update((liste) => [
      ...liste,
      { id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), acteur: this.nomActeur, role: 'Administration', action: 'Cr?ation compte', cible: compte.nom, details: compte.email }
    ]);

    return of(compte);
  }

  modifierCompte(id: string, nom: string, role: string, details: string): Observable<CompteUtilisateur | null> {
    let compte: CompteUtilisateur | null = null;

    this.comptes.update((liste) => liste.map((c) => {
      if (c.id !== id) return c;
      compte = { ...c, nom, role, details };
      return compte;
    }));

    this.journal.update((liste) => [
      ...liste,
      { id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), acteur: this.nomActeur, role: 'Administration', action: 'Modification compte', cible: id, details: `${nom} ? ${role}` }
    ]);

    return of(compte);
  }

  supprimerCompte(id: string): Observable<boolean> {
    this.comptes.update((liste) => liste.filter((c) => c.id !== id));
    this.journal.update((liste) => [
      ...liste,
      { id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), acteur: this.nomActeur, role: 'Administration', action: 'Suppression compte', cible: id, details: 'Compte retir? du r?f?rentiel' }
    ]);
    return of(true);
  }

  reinitialiserMotDePasse(id: string): Observable<boolean> {
    this.journal.update((liste) => [
      ...liste,
      { id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), acteur: this.nomActeur, role: 'Administration', action: 'R?initialisation mot de passe', cible: id, details: 'Mot de passe r?initialis?' }
    ]);
    return of(true);
  }

  purgerJournal(): void {
    this.journal.set([]);
  }
}
