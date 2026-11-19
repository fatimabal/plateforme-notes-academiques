import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, computed, effect, inject, signal, OnInit } from '@angular/core';
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
  protected readonly classesEtudiants = computed(() => {
    const etudiants = this.comptesApi().filter(c => c.role === 'etudiant');
    const q = this.recherche.toLowerCase();
    const filtres = !q ? etudiants : etudiants.filter(c =>
      (c.nom + ' ' + c.prenom + ' ' + c.email + ' ' + (c.etudiant?.matricule ?? '')).toLowerCase().includes(q)
    );
    const map = new Map<string, any[]>();
    for (const e of filtres) {
      const classe = e.etudiant?.inscription?.[0]?.classe?.nomClasse ?? 'Sans classe';
      if (!map.has(classe)) map.set(classe, []);
      map.get(classe)!.push(e);
    }
    return Array.from(map.entries()).map(([nom, etudiants]) => ({ nom, etudiants }));
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
  protected nouveauSpecialite = '';
  protected nouveauGrade = '';
  protected nouveauDateNaissance = '';
  protected nouveauLieuNaissance = '';
  protected nouveauFiliere = '';
  protected nouveauSexe = '';
  protected nouveauClasseId: number | string = '';
  protected nouveauTelephone = '';
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
  protected nouveauMandat = '';
  protected nouveauDateDebut = '';
  protected nouveauDateFin = '';
  protected nouveauProfession = '';
  protected nouveauAdresse = '';
  protected nouveauLienParents = '';
  protected rechercheEtudiant = '';
  protected etudiantsSuggestions: any[] = [];
  protected etudiantsSelectionnes: any[] = [];
  // Affectation enseignants aux modules
  protected moduleAffecter: any = null;
  protected enseignantsListe: any[] = [];
  protected rechercheEnseignant = '';
  protected enseignantsSuggestions: any[] = [];
  protected enseignantsSelectionnes: any[] = [];
  //  data proxy (pour compatibilité avec le HTML existant) 
  protected readonly data = {
    nomActeur: this.nomActeur,
    comptes: this.comptesApi,
    journal: this.journalApi,
  };

  protected detailsUtilisateur = signal<any>(null);
  // ── Génération des bulletins ──
protected semestreSelectionneGeneration = signal<number | string>('');
protected generationEnCours = signal(false);
protected generationResultat = signal<any>(null);
protected generationErreur = signal<string | null>(null);
protected bulletinsExistants = signal<any[]>([]);
protected bulletinVu = signal<any>(null); 
protected voirDetails(c: any): void {
  this.detailsUtilisateur.set(c);
}
  //  Init
  constructor() {
    effect(() => {
      const semestreId = this.semestreSelectionneGeneration();
      if (semestreId) {
        sessionStorage.setItem('admin_semestre_generation', String(semestreId));
        this.verifierBulletinsExistants();
      } else {
        sessionStorage.removeItem('admin_semestre_generation');
        this.bulletinsExistants.set([]);
      }
    });
  }

 ngOnInit(): void {
  this.chargerTout();
  const saved = sessionStorage.getItem('admin_semestre_generation');
  console.log('saved:', saved);
  if (saved) {
    this.semestreSelectionneGeneration.set(saved);
    setTimeout(() => {
      console.log('appel verifier avec:', this.semestreSelectionneGeneration());
      this.verifierBulletinsExistants();
    }, 1000);
  }
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
        error: () => { }
      });
  }

  private chargerStats(): void {
    this.http.get<any>(`${this.apiUrl}/notes/toutes`, { headers: this.headers() })
      .subscribe({
        next: (data) => this.totalNotes = Array.isArray(data) ? data.length : 0,
        error: () => this.totalNotes = 0
      });
    this.http.get<any[]>(`${this.apiUrl}/reclamations`, { headers: this.headers() })
      .subscribe({
        next: (data) => this.totalReclamations = Array.isArray(data) ? data.length : 0,
        error: () => this.totalReclamations = 0
      });
  }

  private chargerJournal(): void {
    this.http.get<any>(`${this.apiUrl}/journal`, { headers: this.headers() })
      .subscribe({
        next: (data) => this.journalApi.set(Array.isArray(data) ? data : (data?.data ?? [])),
        error: () => this.journalApi.set([])
      });
  }

  private chargerDepartements(): void {
    this.http.get<any>(`${this.apiUrl}/departements`, { headers: this.headers() })
      .subscribe({
        next: (d) => {
          const liste = Array.isArray(d) ? d : (d.data ?? d.departements ?? []);
          this.departements.set(liste);
        },
        error: () => { }
      });
  }

  private chargerFilieres(): void {
    this.http.get<any>(`${this.apiUrl}/filieres`, { headers: this.headers() })
      .subscribe({
        next: (d) => this.filieres.set(Array.isArray(d) ? d : (d.data ?? d.filieres ?? [])),
        error: () => { }
      });
  }

  private chargerClasses(): void {
    this.http.get<any>(`${this.apiUrl}/classes`, { headers: this.headers() })
      .subscribe({
        next: (d) => this.classes.set(Array.isArray(d) ? d : (d.data ?? d.classes ?? [])),
        error: () => { }
      });
  }

  private chargerSemestres(): void {
    this.http.get<any>(`${this.apiUrl}/semestres`, { headers: this.headers() })
      .subscribe({
        next: (d) => this.semestres.set(Array.isArray(d) ? d : (d.data ?? d.semestres ?? [])),
        error: () => { }
      });
  }

  private chargerUes(): void {
    this.http.get<any>(`${this.apiUrl}/ues`, { headers: this.headers() })
      .subscribe({
        next: (d) => this.ues.set(Array.isArray(d) ? d : (d.data ?? d.ues ?? [])),
        error: () => { }
      });
  }

  private chargerModules(): void {
    this.http.get<any>(`${this.apiUrl}/matieres`, { headers: this.headers() })
      .subscribe({
        next: (d) => this.modules.set(Array.isArray(d) ? d : (d.data ?? d.matieres ?? [])),
        error: () => { }
      });
  }

  //  Gestion comptes 
  protected basculerFormulaire(): void {
    this.formulaireOuvert.update(v => !v);
    this.nouveauNom = '';
    this.nouveauPrenom = '';
    this.nouvelEmail = '';
    this.nouveauRole = 'etudiant';
    this.nouveauxDetails = '';
    this.nouveauSpecialite = '';
    this.nouveauGrade = '';
    this.nouveauDateNaissance = '';
    this.nouveauLieuNaissance = '';
    this.nouveauFiliere = '';
    this.nouveauSexe = '';
    this.nouveauClasseId = '';
    this.nouveauMandat = '';
    this.nouveauDateDebut = '';
    this.nouveauDateFin = '';
    this.nouveauProfession = '';
    this.nouveauAdresse = '';
    this.nouveauLienParents = '';
    this.nouveauTelephone = '';
    this.chargerFilieres();
    this.rechercheEtudiant = '';
    this.etudiantsSuggestions = [];
    this.etudiantsSelectionnes = [];
  }

  protected creerCompte(): void {
    const body: any = {
      nom: this.nouveauNom,
      prenom: this.nouveauPrenom,
      email: this.nouvelEmail,
      password: 'Password123!',
      password_confirmation: 'Password123!',
      role: this.nouveauRole,
      specialite: this.nouveauSpecialite,
      grade: this.nouveauGrade,
      dateNaissance: this.nouveauDateNaissance,
      lieuNaissance: this.nouveauLieuNaissance,
      filiere: this.nouveauFiliere,
      sexe: this.nouveauSexe,
      classeId: this.nouveauClasseId,
      telephone: this.nouveauTelephone,
      mandat: this.nouveauMandat,
      dateDebut: this.nouveauDateDebut,
      dateFin: this.nouveauDateFin,
      profession: this.nouveauProfession,
      adresse: this.nouveauAdresse,
      lienParents: this.nouveauLienParents,
      etudiantIds: this.etudiantsSelectionnes.map(e => e.etudiant?.id).filter(id => id != null),
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
  protected toggleActif(c: any): void {
    this.http.put(`${this.apiUrl}/utilisateurs/${c.id}/toggle-actif`, {}, { headers: this.headers() })
      .subscribe({
        next: (res: any) => {
          c.actif = res.actif;
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
  protected rechercherEtudiant(): void {
    const q = this.rechercheEtudiant.toLowerCase();
    if (!q) { this.etudiantsSuggestions = []; return; }
    this.etudiantsSuggestions = this.comptesApi()
      .filter(c => c.role === 'etudiant' &&
        (c.nom + ' ' + c.prenom + ' ' + (c.etudiant?.matricule ?? '')).toLowerCase().includes(q))
      .slice(0, 8);
  }

  protected ajouterEtudiant(e: any): void {
    if (!this.etudiantsSelectionnes.find(x => x.id === e.id)) {
      this.etudiantsSelectionnes.push(e);
    }
    this.rechercheEtudiant = '';
    this.etudiantsSuggestions = [];
  }

  protected retirerEtudiant(e: any): void {
    this.etudiantsSelectionnes = this.etudiantsSelectionnes.filter(x => x.id !== e.id);
  }
  protected ouvrirAffectation(m: any): void {
    this.moduleAffecter = m;
    this.enseignantsSelectionnes = m.enseignants ? [...m.enseignants] : [];
    this.rechercheEnseignant = '';
    this.enseignantsSuggestions = [];
    if (this.enseignantsListe.length === 0) {
      this.http.get<any[]>(`${this.apiUrl}/enseignants`, { headers: this.headers() })
        .subscribe({ next: (d) => this.enseignantsListe = d, error: () => { } });
    }
  }

  protected fermerAffectation(): void {
    this.moduleAffecter = null;
    this.rechercheEnseignant = '';
    this.enseignantsSuggestions = [];
    this.enseignantsSelectionnes = [];
  }

  protected rechercherEnseignant(): void {
    const q = this.rechercheEnseignant.toLowerCase();
    if (!q) { this.enseignantsSuggestions = []; return; }
    this.enseignantsSuggestions = this.enseignantsListe
      .filter(e => (e.nom + ' ' + e.prenom).toLowerCase().includes(q))
      .slice(0, 8);
  }

  protected ajouterEnseignant(e: any): void {
    if (!this.enseignantsSelectionnes.find(x => x.id === e.id)) {
      this.enseignantsSelectionnes.push(e);
    }
    this.rechercheEnseignant = '';
    this.enseignantsSuggestions = [];
  }

  protected retirerEnseignant(e: any): void {
    this.enseignantsSelectionnes = this.enseignantsSelectionnes.filter(x => x.id !== e.id);
  }

  protected sauvegarderAffectation(): void {
    if (!this.moduleAffecter) return;
    const enseignantIds = this.enseignantsSelectionnes
      .map(e => e.enseignant?.id ?? e.id)
      .filter(id => id != null);
    this.http.post(
      `${this.apiUrl}/matieres/${this.moduleAffecter.id}/affecter-enseignants`,
      { enseignantIds },
      { headers: this.headers() }
    ).subscribe({
      next: () => { this.fermerAffectation(); this.chargerModules(); },
      error: (e) => alert('Erreur : ' + JSON.stringify(e.error?.message ?? e.message)),
    });
  }
  protected saveSemestreSession(id: any): void {
  sessionStorage.setItem('admin_semestre_generation', String(id));
}

protected clearSemestreSession(): void {
  sessionStorage.removeItem('admin_semestre_generation');
}
  protected genererBulletins(): void {
  const semestreId = this.semestreSelectionneGeneration();
  if (!semestreId) { this.generationErreur.set('Veuillez sélectionner un semestre.'); return; }
  this.generationEnCours.set(true);
  this.generationResultat.set(null);
  this.generationErreur.set(null);
  this.http.post<any>(`${this.apiUrl}/bulletins/generer-masse`, { semestre_id: semestreId }, { headers: this.headers() })
    .subscribe({
      next: (res) => { this.generationEnCours.set(false); this.generationResultat.set(res); this.verifierBulletinsExistants(); },
      error: (e) => { this.generationEnCours.set(false); this.generationErreur.set(e.error?.message ?? 'Erreur.'); }
    });
}

protected verifierBulletinsExistants(): void {
  const semestreId = this.semestreSelectionneGeneration();
  console.log('verifier appelé avec semestreId:', semestreId);
  if (!semestreId) return;
  this.http.get<any>(`${this.apiUrl}/bulletins/semestre/${semestreId}`, { headers: this.headers() })
    .subscribe({
      next: (res) => {
        console.log('bulletins reçus:', res.bulletins?.length);
        this.bulletinsExistants.set(res.bulletins ?? []);
      },
      error: (e) => { console.log('erreur:', e); this.bulletinsExistants.set([]); }
    });
}

protected voirBulletinAdmin(r: any): void {
  // Chercher le bulletin complet dans bulletinsExistants
  const bulletin = this.bulletinsExistants().find(
    (b: any) => (b.etudiant?.user?.prenom + ' ' + b.etudiant?.user?.nom).trim() === r.etudiant
  );
  if (bulletin) {
    this.bulletinVu.set(bulletin);
  } else {
    // Fallback : afficher le résumé
    this.bulletinVu.set(r);
  }
}
}