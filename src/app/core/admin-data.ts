import { Injectable, signal } from '@angular/core';
import { CompteUtilisateur, EntreeAudit } from './models/admin.model';

/**
 * Donnees mockees pour l'espace Admin, en attendant le backend.
 *
 * TODO (integration backend) :
 *  - GET/POST/PATCH/DELETE /api/admin/comptes
 *      (implemente Admin#gererUtilisateurs())
 *  - GET /api/admin/journal-audit -> EntreeAudit[]
 *      (implemente Admin#consulterJournalAudit())
 *  - Chaque action (creation, modification, suppression, reinitialisation)
 *    doit generer une entree d'audit cote serveur.
 */
@Injectable({ providedIn: 'root' })
export class AdminData {
  readonly roles = [
    'Administrateur',
    'Étudiant',
    'Enseignant',
    'Scolarité',
    'Parent',
    'Chef de département',
    'Service des examens',
    'Comptabilité',
  ];

  readonly nomActeur = 'Administrateur Système';

  private readonly comptesSignal = signal<CompteUtilisateur[]>([
    { id: crypto.randomUUID(), nom: 'Étudiant Démo', email: 'etudiant@isi.tn', role: 'Étudiant', details: 'L3 GL · L3-S1', peutSupprimer: true },
    { id: crypto.randomUUID(), nom: 'Amine Ben Salah', email: 'amine@isi.tn', role: 'Étudiant', details: 'L1 GL · L1-S1', peutSupprimer: true },
    { id: crypto.randomUUID(), nom: 'Sarra Trabelsi', email: 'sarra@isi.tn', role: 'Étudiant', details: 'L2 GL · L2-S2', peutSupprimer: true },
    { id: crypto.randomUUID(), nom: 'Pr. Karim Mansour', email: 'enseignant@isi.tn', role: 'Enseignant', details: 'Algorithmique, Bases de données, Programmation Web', peutSupprimer: true },
    { id: crypto.randomUUID(), nom: 'Service Scolarité', email: 'scolarite@isi.tn', role: 'Scolarité', details: '—', peutSupprimer: true },
    { id: crypto.randomUUID(), nom: 'Mme Trabelsi (Parent)', email: 'parent@isi.tn', role: 'Parent', details: '2 enfant(s)', peutSupprimer: true },
    { id: crypto.randomUUID(), nom: 'Dr. Hedi Gharbi', email: 'chef@isi.tn', role: 'Chef de département', details: 'Génie Informatique', peutSupprimer: true },
    { id: crypto.randomUUID(), nom: 'Service des Examens', email: 'examens@isi.tn', role: 'Service des examens', details: '—', peutSupprimer: true },
    { id: crypto.randomUUID(), nom: 'Service Comptabilité', email: 'comptabilite@isi.tn', role: 'Comptabilité', details: '—', peutSupprimer: true },
    { id: crypto.randomUUID(), nom: 'Administrateur Système', email: 'admin@isi.tn', role: 'Administrateur', details: '—', peutSupprimer: false },
  ]);

  private readonly journalSignal = signal<EntreeAudit[]>([
    {
      id: crypto.randomUUID(),
      date: '16/09/2026 08:20:06',
      acteur: 'Administrateur Système',
      role: 'Administrateur',
      action: 'Connexion',
      cible: 'Administrateur Système',
      details: '—',
    },
  ]);

  readonly comptes = this.comptesSignal.asReadonly();
  readonly journal = this.journalSignal.asReadonly();

  private ajouterAudit(action: string, cible: string, details: string): void {
    this.journalSignal.update((liste) => [
      {
        id: crypto.randomUUID(),
        date: new Date().toLocaleString('fr-FR'),
        acteur: this.nomActeur,
        role: 'Administrateur',
        action,
        cible,
        details,
      },
      ...liste,
    ]);
  }

  creerCompte(compte: Omit<CompteUtilisateur, 'id' | 'peutSupprimer'>): void {
    const nouveau: CompteUtilisateur = { ...compte, id: crypto.randomUUID(), peutSupprimer: true };
    this.comptesSignal.update((liste) => [...liste, nouveau]);
    this.ajouterAudit('Création de compte', compte.nom, compte.role);
  }

  modifierCompte(id: string, nom: string, role: string, details: string): void {
    this.comptesSignal.update((liste) =>
      liste.map((c) => (c.id === id ? { ...c, nom, role, details } : c))
    );
    this.ajouterAudit('Modification de compte', nom, role);
  }

  supprimerCompte(id: string): void {
    const compte = this.comptesSignal().find((c) => c.id === id);
    if (!compte || !compte.peutSupprimer) return;
    this.comptesSignal.update((liste) => liste.filter((c) => c.id !== id));
    this.ajouterAudit('Suppression de compte', compte.nom, compte.role);
  }

  reinitialiserMotDePasse(id: string): void {
    const compte = this.comptesSignal().find((c) => c.id === id);
    if (!compte) return;
    this.ajouterAudit('Réinitialisation mot de passe', compte.nom, compte.role);
  }

  purgerJournal(): void {
    this.journalSignal.set([]);
  }
}