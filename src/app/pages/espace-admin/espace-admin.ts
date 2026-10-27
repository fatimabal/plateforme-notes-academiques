import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
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
export class EspaceAdmin implements OnInit {
  protected readonly data = inject(AdminData);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api';

  protected readonly roles = this.data.roles;
  protected readonly recherche = signal('');
  protected readonly roleFiltre = signal('Tous les rôles');

  protected readonly comptesFiltres = computed(() => {
    const texte = this.recherche().toLowerCase().trim();
    const role = this.roleFiltre();
    return this.data.comptes().filter((c) => {
      const matchRole = role === 'Tous les rôles' || c.role === role;
      const matchTexte = !texte || c.nom.toLowerCase().includes(texte) || c.email.toLowerCase().includes(texte);
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

  protected readonly totalNotes = 0;
  protected readonly totalReclamations = 0;

  protected readonly formulaireOuvert = signal(false);
  protected nouveauNom = '';
  protected nouvelEmail = '';
  protected nouveauRole = this.roles[1];
  protected nouveauxDetails = '';

  protected readonly compteEnEdition = signal<string | null>(null);
  protected nomEdite = '';
  protected roleEdite = '';
  protected detailsEdites = '';

  protected readonly compteReinitialise = signal<string | null>(null);

  protected readonly onglets = ['Départements', 'Filières', 'Classes', 'Semestres', 'UE', 'Modules'];
  protected readonly ongletActif = signal('Départements');

  protected readonly departements = signal<any[]>([]);
  protected readonly filieres = signal<any[]>([]);
  protected readonly classes = signal<any[]>([]);
  protected readonly semestres = signal<any[]>([]);
  protected readonly ues = signal<any[]>([]);
  protected readonly modules = signal<any[]>([]);

protected champNom = '';
protected champDiplome = '';
  protected champNiveau = '';
  protected champDepartementId: number | null = null;
  protected champFiliereId: number | null = null;
  protected champSemestreId: number | null = null;
  protected champUeId: number | null = null;
  protected champCoefficient: number = 1;
  protected champCredits: number = 1;
  protected champVolumeHoraire: number = 0;
  protected refEnEdition: any = null;
  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  ngOnInit(): void {
    this.chargerTout();
  }

  private chargerTout(): void {
    this.charger('departements', this.departements);
    this.charger('filieres', this.filieres);
    this.charger('classes', this.classes);
    this.charger('semestres', this.semestres);
    this.charger('ues', this.ues);
    this.charger('matieres', this.modules);
  }

  private charger(endpoint: string, cible: ReturnType<typeof signal<any[]>>): void {
    this.http.get<any[]>(`${this.apiUrl}/${endpoint}`, { headers: this.headers }).subscribe({
      next: (data) => cible.set(Array.isArray(data) ? data : []),
      error: () => cible.set([])
    });
  }

  private chargerEndpoint(onglet: string): void {
    if (onglet === 'Départements') this.charger('departements', this.departements);
    else if (onglet === 'Filières') this.charger('filieres', this.filieres);
    else if (onglet === 'Classes') this.charger('classes', this.classes);
    else if (onglet === 'Semestres') this.charger('semestres', this.semestres);
    else if (onglet === 'UE') this.charger('ues', this.ues);
    else if (onglet === 'Modules') this.charger('matieres', this.modules);
  }
protected ajouterRef(): void {
  const onglet = this.ongletActif();
  let endpoint = '';
  let body: any = {};

  if (onglet === 'Départements') {
    endpoint = 'departements';
    body = { nom: this.champNom };
  } else if (onglet === 'Filières') {
    endpoint = 'filieres';
    body = { nom: this.champNom, diplome: this.champDiplome, departement_id: Number(this.champDepartementId) };
  } else if (onglet === 'Classes') {
    endpoint = 'classes';
    body = { nomClasse: this.champNom, niveau: this.champNiveau, filiere_id: Number(this.champFiliereId) };
  } else if (onglet === 'Semestres') {
    endpoint = 'semestres';
    body = { libelle: this.champNom };
  } else if (onglet === 'UE') {
    endpoint = 'ues';
    body = { libelle: this.champNom, credits: Number(this.champCredits), semestre_id: Number(this.champSemestreId) };
  } else if (onglet === 'Modules') {
    endpoint = 'matieres';
    body = { libelle: this.champNom, coefficient: this.champCoefficient, credits: this.champCredits, volumeHoraire: this.champVolumeHoraire, ue_id: Number(this.champUeId) };
  }

  const requete = this.refEnEdition
    ? this.http.put<any>(`${this.apiUrl}/${endpoint}/${this.refEnEdition.id}`, body, { headers: this.headers })
    : this.http.post<any>(`${this.apiUrl}/${endpoint}`, body, { headers: this.headers });

  requete.subscribe({
    next: () => {
      this.champNom = '';
      this.champDiplome = '';
      this.champNiveau = '';
      this.champDepartementId = null;
      this.champFiliereId = null;
      this.champSemestreId = null;
      this.champUeId = null;
      this.champVolumeHoraire = 0;
      this.refEnEdition = null;
      this.chargerEndpoint(onglet);
    },
    error: (err) => console.error('ERREUR AJOUT:', err)
  });
}

protected modifierRef(item: any): void {
  const onglet = this.ongletActif();
  this.refEnEdition = item;
  if (onglet === 'Départements') {
    this.champNom = item.nom;
  } else if (onglet === 'Filières') {
    this.champNom = item.nom;
    this.champDiplome = item.diplome ?? '';
    this.champDepartementId = item.departement_id;
  } else if (onglet === 'Classes') {
    this.champNom = item.nomClasse;
    this.champNiveau = item.niveau;
    this.champFiliereId = item.filiere_id;
  } else if (onglet === 'Semestres') {
    this.champNom = item.libelle;
  } else if (onglet === 'UE') {
    this.champNom = item.libelle;
    this.champCredits = item.credits;
    this.champSemestreId = item.semestre_id;
  } else if (onglet === 'Modules') {
    this.champNom = item.libelle;
    this.champCoefficient = item.coefficient;
    this.champCredits = item.credits;
    this.champVolumeHoraire = item.volumeHoraire;
    this.champUeId = item.ue_id;
  }
}

protected annulerModif(): void {
  this.refEnEdition = null;
  this.champNom = '';
  this.champDiplome = '';
  this.champNiveau = '';
  this.champDepartementId = null;
  this.champFiliereId = null;
  this.champSemestreId = null;
  this.champUeId = null;
  this.champVolumeHoraire = 0;
}
   
  protected supprimerRef(endpoint: string, id: number): void {
    if (!confirm('Supprimer cet élément ?')) return;
    const onglet = this.ongletActif();
    this.http.delete(`${this.apiUrl}/${endpoint}/${id}`, { headers: this.headers }).subscribe({
      next: () => this.chargerEndpoint(onglet),
      error: () => {}
    });
  }

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
    if (!confirm('Purger tout le journal ?')) return;
    this.data.purgerJournal();
  }
}