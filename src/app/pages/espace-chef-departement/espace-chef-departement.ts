import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../core/notification.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SEUIL_DIFFICULTE = 13;

@Component({
  selector: 'app-espace-chef-departement',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './espace-chef-departement.html',
  styleUrl: './espace-chef-departement.scss',
})
export class EspaceChefDepartement implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api';
  protected readonly notif = inject(NotificationService);
  protected afficherNotifs = signal(false);

  protected readonly nomChef = localStorage.getItem('nom') ?? 'Chef Département';

  // Onglets
  protected readonly ongletActif = signal<'tableau-bord' | 'reclamations' | 'journal' | 'profil'>('tableau-bord');

  // Bulletins (source principale de données)
  protected readonly bulletins = signal<any[]>([]);
  protected readonly bulletinVu = signal<any>(null);
  protected readonly pdfEnCours = signal(false);

  // Semestres disponibles (depuis l'API)
  protected readonly semestresDisponibles = signal<{ id: number; libelle: string }[]>([]);
  protected readonly semestreSelectionne = signal<{ id: number; libelle: string } | null>(null);

  // Réclamations
  protected readonly reclamations = signal<any[]>([]);
  private readonly toutesLesReclamations = signal<any[]>([]);

  // Journal d'audit
  protected readonly journal = signal<any[]>([]);

  // Profil
  protected profil = signal<any>(null);
  protected readonly enEditionProfil = signal(false);
  protected nomEdite = '';
  protected prenomEdite = '';
  protected emailEdite = '';
  protected telephoneEdite = '';
  protected specialiteEditee = '';
  protected gradeEdite = '';
  protected mandatEdite = '';
  protected dateDebutEditee = '';
  protected dateFinEditee = '';
  protected motDePasseEdite = '';
  protected motDePasseConfirme = '';
  protected readonly messageSuccesProfil = signal('');
  protected readonly messageErreurProfil = signal('');

  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  // Semestres pour les boutons (libellés)
  protected readonly semestres = computed(() =>
    this.semestresDisponibles().map(s => s.libelle)
  );

  // Tableau de bord calculé depuis les bulletins du semestre sélectionné
  protected readonly tableauBord = computed(() => {
    // Filtrer les bulletins sans étudiant inscrit dans une classe valide
    const bs = this.bulletins().filter(b =>
      b.etudiant?.inscription?.[0]?.classe?.nomClasse
    );
    if (!bs || bs.length === 0) return null;

    const reclamations = this.toutesLesReclamations();
    const reclamationsTotal = reclamations.length;
    const reclamationsTraitees = reclamations.filter(r => r.statut === 'traitee').length;

    // Moyenne générale = moyenne des moyennes_generale des bulletins
    const moyennes = bs.map(b => Number(b.moyenne_generale)).filter(v => !isNaN(v));
    const moyenneGenerale = moyennes.length
      ? Math.round((moyennes.reduce((a, b) => a + b, 0) / moyennes.length) * 10) / 10
      : 0;
    const tauxReussite = moyennes.length
      ? Math.round((moyennes.filter(v => v >= 10).length / moyennes.length) * 100)
      : 0;
    const etudiantsEvalues = bs.length;

    // Moyennes par classe
    const parClasse = new Map<string, number[]>();
    for (const b of bs) {
      const classe = b.etudiant?.inscription?.[0]?.classe?.nomClasse ?? 'Inconnue';
      if (!parClasse.has(classe)) parClasse.set(classe, []);
      parClasse.get(classe)!.push(Number(b.moyenne_generale));
    }
    const moyennesParClasse = Array.from(parClasse.entries()).map(([classe, vals]) => ({
      classe,
      etudiants: vals.length,
      moyenne: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10,
    }));

    // Distribution des moyennes par module (toutes les moyenne_module de tous les bulletins)
    const toutesNoteModules: number[] = [];
    for (const b of bs) {
      for (const detail of (b.details ?? [])) {
        for (const m of (detail.ue?.modules ?? [])) {
          if (m.moyenne_module != null) toutesNoteModules.push(Number(m.moyenne_module));
        }
      }
    }
    const tranches = [
      { tranche: '0–5', min: 0, max: 5 },
      { tranche: '6–9', min: 6, max: 9 },
      { tranche: '10–12', min: 10, max: 12 },
      { tranche: '13–15', min: 13, max: 15 },
      { tranche: '16–20', min: 16, max: 20 },
    ];
    const distribution = tranches.map(t => ({
      tranche: t.tranche,
      count: toutesNoteModules.filter(v => v >= t.min && v <= t.max).length,
    }));

    // Moyennes par module (depuis les détails des bulletins)
    const parModule = new Map<string, { devoirs: number[]; examens: number[]; moyennes: number[] }>();
    for (const b of bs) {
      for (const detail of (b.details ?? [])) {
        for (const m of (detail.ue?.modules ?? [])) {
          const libelle = m.libelle ?? 'Inconnu';
          if (!parModule.has(libelle)) parModule.set(libelle, { devoirs: [], examens: [], moyennes: [] });
          const entry = parModule.get(libelle)!;
          if (m.mcc != null) entry.devoirs.push(Number(m.mcc));
          if (m.examen != null) entry.examens.push(Number(m.examen));
          if (m.moyenne_module != null) entry.moyennes.push(Number(m.moyenne_module));
        }
      }
    }
    const moyennesParModule = Array.from(parModule.entries()).map(([module, data]) => ({
      module,
      notes: data.moyennes.length,
      moyenneDevoir: data.devoirs.length
        ? Math.round((data.devoirs.reduce((a, b) => a + b, 0) / data.devoirs.length) * 10) / 10
        : null,
      moyenneExamen: data.examens.length
        ? Math.round((data.examens.reduce((a, b) => a + b, 0) / data.examens.length) * 10) / 10
        : null,
      moyenne: data.moyennes.length
        ? Math.round((data.moyennes.reduce((a, b) => a + b, 0) / data.moyennes.length) * 10) / 10
        : 0,
    }));

    return {
      tauxReussite, etudiantsEvalues, moyenneGenerale,
      reclamationsTotal, reclamationsTraitees,
      moyennesParClasse, distribution, moyennesParModule
    };
  });

  protected readonly maxDistribution = computed(() => {
    const t = this.tableauBord();
    if (!t || !t.distribution.length) return 1;
    return Math.max(1, ...t.distribution.map(d => d.count));
  });

  protected readonly meilleuresPerformances = computed(() => {
    const t = this.tableauBord();
    if (!t) return [];
    return [...t.moyennesParModule].sort((a, b) => b.moyenne - a.moyenne).slice(0, 3);
  });

  protected readonly modulesLesPlusFaibles = computed(() => {
    const t = this.tableauBord();
    if (!t) return [];
    return [...t.moyennesParModule].sort((a, b) => a.moyenne - b.moyenne).slice(0, 3);
  });

  protected readonly classesEnDifficulte = computed(() => {
    const t = this.tableauBord();
    if (!t) return [];
    return t.moyennesParClasse.filter(c => c.moyenne < SEUIL_DIFFICULTE);
  });

  ngOnInit(): void {
    this.notif.charger();
    this.chargerSemestres();
    this.chargerReclamations();
    this.chargerProfil();
    this.chargerJournal();
  }

  private chargerJournal(): void {
    this.http.get<any[]>(`${this.apiUrl}/journal`, { headers: this.headers }).subscribe({
      next: (data) => this.journal.set(Array.isArray(data) ? data : []),
      error: () => this.journal.set([])
    });
  }

  private chargerReclamations(): void {
    this.http.get<any[]>(`${this.apiUrl}/reclamations/toutes`, { headers: this.headers }).subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : [];
        this.reclamations.set(list);
        this.toutesLesReclamations.set(list);
      },
      error: () => {
        this.reclamations.set([]);
        this.toutesLesReclamations.set([]);
      }
    });
  }

  private chargerProfil(): void {
    this.http.get<any>(`${this.apiUrl}/profile`, { headers: this.headers }).subscribe({
      next: (data) => {
        this.profil.set(data);
        this.nomEdite = data.nom ?? '';
        this.prenomEdite = data.prenom ?? '';
        this.emailEdite = data.email ?? '';
        this.telephoneEdite = data.telephone ?? '';
        this.specialiteEditee = data.chefDepartement?.specialite ?? '';
        this.gradeEdite = data.chefDepartement?.grade ?? '';
        this.mandatEdite = data.chefDepartement?.mandat ?? '';
        this.dateDebutEditee = data.chefDepartement?.dateDebut ?? '';
        this.dateFinEditee = data.chefDepartement?.dateFin ?? '';
      }
    });
  }

  protected sauvegarderProfil(): void {
    if (this.motDePasseEdite && this.motDePasseEdite !== this.motDePasseConfirme) {
      this.messageErreurProfil.set('Les mots de passe ne correspondent pas.');
      this.messageSuccesProfil.set('');
      return;
    }
    const body: any = {
      nom: this.nomEdite,
      prenom: this.prenomEdite,
      email: this.emailEdite,
      telephone: this.telephoneEdite,
      specialite: this.specialiteEditee,
      grade: this.gradeEdite,
      mandat: this.mandatEdite,
      dateDebut: this.dateDebutEditee,
      dateFin: this.dateFinEditee,
    };
    if (this.motDePasseEdite) {
      body.password = this.motDePasseEdite;
      body.password_confirmation = this.motDePasseConfirme;
    }
    this.http.put(`${this.apiUrl}/profile`, body, { headers: this.headers }).subscribe({
      next: () => {
        this.messageSuccesProfil.set('Profil mis à jour avec succès.');
        this.messageErreurProfil.set('');
        this.enEditionProfil.set(false);
        this.motDePasseEdite = '';
        this.motDePasseConfirme = '';
        this.chargerProfil();
      },
      error: () => {
        this.messageErreurProfil.set('Erreur lors de la mise à jour.');
        this.messageSuccesProfil.set('');
      }
    });
  }

  protected traiterReclamation(id: number, statut: string): void {
    this.http.put(`${this.apiUrl}/reclamations/${id}`, { statut }, { headers: this.headers }).subscribe({
      next: () => this.chargerReclamations(),
      error: () => {}
    });
  }

  private chargerSemestres(): void {
    this.http.get<any[]>(`${this.apiUrl}/semestres`, { headers: this.headers }).subscribe({
      next: (data) => {
        const sems = Array.isArray(data) ? data : [];
        this.semestresDisponibles.set(sems);
        if (sems.length > 0) {
          this.semestreSelectionne.set(sems[0]);
          this.chargerBulletinsSemestre(sems[0].id);
        }
      },
      error: () => {
        // Fallback : semestres fixes
        const fallback = [{ id: 1, libelle: 'Semestre 1' }, { id: 2, libelle: 'Semestre 2' }];
        this.semestresDisponibles.set(fallback);
        this.semestreSelectionne.set(fallback[0]);
        this.chargerBulletinsSemestre(fallback[0].id);
      }
    });
  }

  protected chargerBulletinsSemestre(semestreId: number): void {
    this.http.get<any>(`${this.apiUrl}/bulletins/semestre/${semestreId}`, { headers: this.headers }).subscribe({
      next: (res) => this.bulletins.set(res.bulletins ?? []),
      error: () => this.bulletins.set([])
    });
  }

  protected selectionnerSemestre(libelle: string): void {
    const sem = this.semestresDisponibles().find(s => s.libelle === libelle);
    if (!sem) return;
    this.semestreSelectionne.set(sem);
    this.chargerBulletinsSemestre(sem.id);
  }

  protected largeurBarre(count: number): number {
    return (count / this.maxDistribution()) * 100;
  }

  protected async telechargerPDF(): Promise<void> {
    const element = document.getElementById('contenu-bulletin-chef');
    if (!element) return;
    this.pdfEnCours.set(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const b = this.bulletinVu();
      const nom = b?.etudiant?.user ? `${b.etudiant.user.prenom}_${b.etudiant.user.nom}` : 'bulletin';
      const semestre = b?.semestre?.libelle ?? 'semestre';
      pdf.save(`bulletin_${nom}_${semestre}.pdf`.replace(/\s+/g, '_'));
    } finally {
      this.pdfEnCours.set(false);
    }
  }
}