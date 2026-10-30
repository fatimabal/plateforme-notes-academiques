import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/notification.service';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-espace-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './espace-admin.html',
styleUrl: './espace-admin.scss',
})
export class EspaceAdmin implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api';
  protected readonly notif = inject(NotificationService);

  protected readonly nomActeur = `${localStorage.getItem('prenom') ?? ''} ${localStorage.getItem('nom') ?? ''}`.trim() || 'Administrateur';

  // ── Comptes 
  private readonly comptesApi = signal<any[]>([]);
  protected readonly comptes = this.comptesApi; // alias pour le HTML (data.comptes())

  protected readonly roles = [
    'admin',
    'enseignant',
    'etudiant',
    'scolarite',
    'chef_departement',
    'parent',
    'agent_service_examen',
  ];

  protected recherche = '';
  protected readonly roleFiltre = signal<string>('Tous les rôles');

  protected readonly comptesFiltres = computed(() => {
    const q = this.recherche.toLowerCase();
    const r = this.roleFiltre();
    return this.comptesApi().filter(c => {
      const nomOk = !q || (c.nom + ' ' + c.prenom + ' ' + c.email).toLowerCase().includes(q);
      const roleOk = r === 'Tous les rôles' || c.role === r;
      return nomOk && roleOk;
    });
  });

  protected readonly repartitionRoles = computed(() => {
    const map = new Map<string, number>();
    for (const c of this.comptesApi()) {
      map.set(c.role, (map.get(c.role) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([role, count]) => ({ role, count }));
  });

  // Statistiques
  protected totalNotes = 0;
  protected totalReclamations = 0;

  // Formulaire création
  protected formulaireOuvert = signal(false);
  protected nouveauNom = '';
  protected nouveauPrenom = '';
  protected nouvelEmail = '';
  protected nouveauRole = 'etudiant';
  protected nouveauxDetails = '';

  // Edition
  protected readonly compteEnEdition = signal<number | null>(null);
  protected nomEdite = '';
  protected prenomEdite = '';
  protected roleEdite = '';
  protected detailsEdites = '';
  protected readonly compteReinitialise = signal<number | null>(null);

  //  Journal d'audit 
  private readonly journalApi = signal<any[]>([]);
  protected readonly journal = this.journalApi; // alias pour data.journal()

  //  Données de référence 
  protected readonly onglets = ['Départements', 'Filières', 'Classes', 'Semestres', 'UE', 'Modules'];
  protected readonly ongletActif = signal('Départements');

  protected readonly departements = signal<any[]>([]);
  protected readonly filieres = signal<any[]>([]);
  protected readonly classes = signal<any[]>([]);
  protected readonly semestres = signal<any[]>([]);
  protected readonly ues = signal<any[]>([]);
  protected readonly modules = signal<any[]>([]);

  // Champs formulaire référence
  protected champNom = '';
  protected champDiplome = '';
  protected champNiveau = '';
  protected champCredits: number | null = null;
  protected champCoefficient: number | null = null;
  protected champVolumeHoraire: number | null = null;
  protected champDepartementId: number | null = null;
  protected champFiliereId: number | null = null;
  protected champSemestreId: number | null = null;
  protected champUeId: number | null = null;
  protected refEnEdition: any = null;

  //  data proxy (pour compatibilité avec le HTML existant) 
  protected readonly data = {
    nomActeur: this.nomActeur,
    comptes: this.comptesApi,
    journal: this.journalApi,
  };

  //  Init 
  ngOnInit(): void {
    this.chargerTout();
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  private chargerTout(): void {
    this.chargerComptes();
    this.chargerStats();
    this.chargerJournal();
    this.chargerDepartements();
    this.chargerFilieres();
    this.chargerClasses();
    this.chargerSemestres();
    this.chargerUes();
    this.chargerModules();
  }

  private chargerComptes(): void {
  this.http.get<any>(`${this.apiUrl}/utilisateurs`, { headers: this.headers() })
    .subscribe({ 
      next: (data) => {
        // gère les deux formats : tableau direct ou { users: [...] }
        const liste = Array.isArray(data) ? data : (data.users ?? data.data ?? []);
        this.comptesApi.set(liste);
      }, 
      error: () => {} 
    });
}

  private chargerStats(): void {
    this.http.get<any>(`${this.apiUrl}/notes/toutes`, { headers: this.headers() })
      .subscribe({ next: (data) => this.totalNotes = Array.isArray(data) ? data.length : (data?.total ?? 0), error: () => { } });
    this.http.get<any[]>(`${this.apiUrl}/reclamations`, { headers: this.headers() })
      .subscribe({ next: (data) => this.totalReclamations = data.length, error: () => { } });
  }

  private chargerJournal(): void {
    this.http.get<any[]>(`${this.apiUrl}/journal`, { headers: this.headers() })
      .subscribe({ next: (data) => this.journalApi.set(data), error: () => { } });
  }

  private chargerDepartements(): void {
    this.http.get<any[]>(`${this.apiUrl}/departements`, { headers: this.headers() })
      .subscribe({ next: (d) => this.departements.set(d), error: () => { } });
  }

  private chargerFilieres(): void {
    this.http.get<any[]>(`${this.apiUrl}/filieres`, { headers: this.headers() })
      .subscribe({ next: (d) => this.filieres.set(d), error: () => { } });
  }

  private chargerClasses(): void {
    this.http.get<any[]>(`${this.apiUrl}/classes`, { headers: this.headers() })
      .subscribe({ next: (d) => this.classes.set(d), error: () => { } });
  }

  private chargerSemestres(): void {
    this.http.get<any[]>(`${this.apiUrl}/semestres`, { headers: this.headers() })
      .subscribe({ next: (d) => this.semestres.set(d), error: () => { } });
  }

  private chargerUes(): void {
    this.http.get<any[]>(`${this.apiUrl}/ues`, { headers: this.headers() })
      .subscribe({ next: (d) => this.ues.set(d), error: () => { } });
  }

  private chargerModules(): void {
    this.http.get<any[]>(`${this.apiUrl}/matieres`, { headers: this.headers() })
      .subscribe({ next: (d) => this.modules.set(d), error: () => { } });
  }

  //  Gestion comptes 
  protected basculerFormulaire(): void {
    this.formulaireOuvert.update(v => !v);
    this.nouveauNom = '';
    this.nouveauPrenom = '';
    this.nouvelEmail = '';
    this.nouveauRole = 'etudiant';
    this.nouveauxDetails = '';
  }

  protected creerCompte(): void {
    const body = {
      nom: this.nouveauNom,
      prenom: this.nouveauPrenom,
      email: this.nouvelEmail,
      password: 'Password123!',
      password_confirmation: 'Password123!',
      role: this.nouveauRole,
    };
    this.http.post(`${this.apiUrl}/register`, body, { headers: this.headers() })
      .subscribe({
        next: () => { this.basculerFormulaire(); this.chargerComptes(); },
        error: (e) => alert('Erreur : ' + JSON.stringify(e.error?.errors ?? e.error?.message ?? e.message)),
      });
  }

  protected ouvrirEdition(c: any): void {
    this.compteEnEdition.set(c.id);
    this.nomEdite = c.nom ?? '';
    this.prenomEdite = c.prenom ?? '';
    this.roleEdite = c.role ?? '';
    this.detailsEdites = c.details ?? '';
  }

  protected enregistrerEdition(c: any): void {
    const body = { nom: this.nomEdite, prenom: this.prenomEdite, role: this.roleEdite };
    this.http.put(`${this.apiUrl}/utilisateurs/${c.id}`, body, { headers: this.headers() })
      .subscribe({
        next: () => { this.compteEnEdition.set(null); this.chargerComptes(); },
        error: () => { },
      });
  }

  protected annulerEditionCompte(): void {
    this.compteEnEdition.set(null);
  }

  protected supprimerCompte(c: any): void {
    if (!confirm(`Supprimer ${c.nom} ${c.prenom ?? ''} ?`)) return;
    this.http.delete(`${this.apiUrl}/utilisateurs/${c.id}`, { headers: this.headers() })
      .subscribe({ next: () => this.chargerComptes(), error: () => { } });
  }

  protected reinitialiserMotDePasse(c: any): void {
    this.http.post(`${this.apiUrl}/utilisateurs/${c.id}/reinitialiser-mot-de-passe`, {}, { headers: this.headers() })
      .subscribe({
        next: () => {
          this.compteReinitialise.set(c.id);
          setTimeout(() => this.compteReinitialise.set(null), 3000);
        },
        error: () => { },
      });
  }

  //  Journal 
  protected purgerJournal(): void {
    if (!confirm('Purger tout le journal d\'audit ?')) return;
    this.http.delete(`${this.apiUrl}/journal`, { headers: this.headers() })
      .subscribe({ next: () => this.journalApi.set([]), error: () => { } });
  }

  //  Données de référence 
  protected ajouterRef(): void {
    const onglet = this.ongletActif();
    let url = '';
    let body: any = {};

    if (onglet === 'Départements') {
      url = `${this.apiUrl}/departements`;
      body = { nom: this.champNom };
    } else if (onglet === 'Filières') {
      url = `${this.apiUrl}/filieres`;
      body = { nom: this.champNom, diplome: this.champDiplome, departement_id: this.champDepartementId };
    } else if (onglet === 'Classes') {
      url = `${this.apiUrl}/classes`;
      body = { nomClasse: this.champNom, niveau: this.champNiveau, filiere_id: this.champFiliereId };
    } else if (onglet === 'Semestres') {
      url = `${this.apiUrl}/semestres`;
      body = { libelle: this.champNom };
    } else if (onglet === 'UE') {
      url = `${this.apiUrl}/ues`;
      body = { libelle: this.champNom, credits: this.champCredits, semestre_id: this.champSemestreId };
    } else if (onglet === 'Modules') {
      url = `${this.apiUrl}/matieres`;
      body = { libelle: this.champNom, coefficient: this.champCoefficient, credits: this.champCredits, volumeHoraire: this.champVolumeHoraire, ue_id: this.champUeId };
    }

    if (this.refEnEdition) {
      this.http.put(`${url}/${this.refEnEdition.id}`, body, { headers: this.headers() })
        .subscribe({ next: () => { this.annulerModif(); this.rechargerRef(); }, error: () => { } });
    } else {
      this.http.post(url, body, { headers: this.headers() })
        .subscribe({ next: () => { this.reinitialiserChamps(); this.rechargerRef(); }, error: () => { } });
    }
  }

  protected modifierRef(item: any): void {
    this.refEnEdition = item;
    this.champNom = item.nom ?? item.libelle ?? item.nomClasse ?? '';
    this.champDiplome = item.diplome ?? '';
    this.champNiveau = item.niveau ?? '';
    this.champCredits = item.credits ?? null;
    this.champCoefficient = item.coefficient ?? null;
    this.champVolumeHoraire = item.volumeHoraire ?? null;
    this.champDepartementId = item.departement_id ?? null;
    this.champFiliereId = item.filiere_id ?? null;
    this.champSemestreId = item.semestre_id ?? null;
    this.champUeId = item.ue_id ?? null;
  }

  protected annulerModif(): void {
    this.refEnEdition = null;
    this.reinitialiserChamps();
  }

  protected supprimerRef(type: string, id: number): void {
    if (!confirm('Supprimer cet élément ?')) return;
    this.http.delete(`${this.apiUrl}/${type}/${id}`, { headers: this.headers() })
      .subscribe({ next: () => this.rechargerRef(), error: () => { } });
  }

  private reinitialiserChamps(): void {
    this.champNom = '';
    this.champDiplome = '';
    this.champNiveau = '';
    this.champCredits = null;
    this.champCoefficient = null;
    this.champVolumeHoraire = null;
    this.champDepartementId = null;
    this.champFiliereId = null;
    this.champSemestreId = null;
    this.champUeId = null;
  }

  private rechargerRef(): void {
    const onglet = this.ongletActif();
    if (onglet === 'Départements') this.chargerDepartements();
    else if (onglet === 'Filières') { this.chargerFilieres(); this.chargerDepartements(); }
    else if (onglet === 'Classes') { this.chargerClasses(); this.chargerFilieres(); }
    else if (onglet === 'Semestres') this.chargerSemestres();
    else if (onglet === 'UE') { this.chargerUes(); this.chargerSemestres(); }
    else if (onglet === 'Modules') { this.chargerModules(); this.chargerUes(); }
  }
}