import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../core/notification.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-espace-etudiant',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './espace-etudiant.html',
  styleUrl: './espace-etudiant.scss',
})
export class EspaceEtudiant implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api';
  protected readonly notif = inject(NotificationService);
  protected afficherNotifs = signal(false);

  // Profil étudiant
  protected readonly matricule = signal<string>('—');
  protected readonly dateNaissance = signal<string>('—');
  protected readonly lieuNaissance = signal<string>('—');
  protected readonly filiere = signal<string>('—');
  protected readonly ongletActif = signal<'notes' | 'reclamations' | 'profil'>('notes');
  protected readonly nomEtudiant = signal<string>('');
  protected readonly classe = signal<string>('—');
  protected readonly semestreSelectionneCode = signal<string | null>(null);

  // champs édition profil
  protected nomEdite = '';
  protected prenomEdite = '';
  protected dateNaissanceEditee = '';
  protected lieuNaissanceEdite = '';
  protected sexeEdite = '';
  protected telephoneEdite = '';
  protected readonly profilEnEdition = signal(false);
  protected readonly securiteEnEdition = signal(false);
  protected readonly securiteErreur = signal<string | null>(null);
  protected readonly securiteSucces = signal(false);
  protected emailEdite = '';
  protected motDePasseEdite = '';
  protected motDePasseConfirme = '';
  protected readonly emailActuel = signal<string>('');

  // Notes brutes depuis l'API
  private readonly notesApi = signal<any[]>([]);
  private readonly semestresApi = signal<any[]>([]);

  // Bulletin
  protected readonly bulletinOuvert = signal(false);
  protected readonly bulletinData = signal<any>(null);
  protected readonly bulletinsCache = signal<any[]>([]);
  protected readonly bulletinChargement = signal(false);
  protected readonly pdfEnCours = signal(false);

  // Réclamations
  protected readonly reclamationOuverte = signal<string | null>(null);
  protected readonly mesReclamations = signal<any[]>([]);
  protected motifReclamation = '';
  protected readonly reclamationsEnvoyees = signal<Set<string>>(new Set());

  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  protected readonly semestres = computed(() => {
    return this.semestresApi().map((s, i) => ({
      id: s.id,
      code: s.libelle,
      label: s.libelle,
      actuel: i === this.semestresApi().length - 1,
    }));
  });

  protected readonly modulesAffiches = computed(() => {
    const code = this.semestreSelectionneCode();
    const notes = this.notesApi().filter(n => n.semestre?.libelle === code);

    const parMatiere = new Map<string, any[]>();
    for (const n of notes) {
      const mat = n.matiere?.libelle ?? '—';
      if (!parMatiere.has(mat)) parMatiere.set(mat, []);
      parMatiere.get(mat)!.push(n);
    }

    return Array.from(parMatiere.entries()).map(([matiere, notes]) => {
      const evaluations = notes.map(n => ({
        id: n.id,
        type: n.type ?? n.evaluation?.typeEvaluation ?? '—',
        note: n.valeur,
        coefficient: n.coefficient ?? 1,
        date: n.dateSaisie ?? n.evaluation?.dateEvaluation ?? '—',
      }));
      const total = evaluations.reduce((s, e) => s + e.note * e.coefficient, 0);
      const totalCoef = evaluations.reduce((s, e) => s + e.coefficient, 0);
      const moyenne = totalCoef > 0 ? Math.round((total / totalCoef) * 10) / 10 : 0;
      return { matiere, evaluations, moyenne };
    });
  });

  protected readonly moyenneSemestre = computed(() => {
    // Si un bulletin existe pour ce semestre, utiliser sa moyenne_generale
    const code = this.semestreSelectionneCode();
    const bulletin = this.bulletinsCache().find(b => b.semestre?.libelle === code);
    if (bulletin?.moyenne_generale != null) {
      return bulletin.moyenne_generale;
    }
    // Sinon calculer depuis les notes
    const mods = this.modulesAffiches();
    if (mods.length === 0) return null;
    const total = mods.reduce((s, m) => s + m.moyenne, 0);
    return Math.round((total / mods.length) * 10) / 10;
  });

  ngOnInit(): void {
    this.notif.charger();

    const prenom = localStorage.getItem('prenom') ?? '';
    const nom = localStorage.getItem('nom') ?? '';
    this.nomEtudiant.set(`${prenom} ${nom}`.trim() || 'Étudiant');

    this.http.get<any>(`${this.apiUrl}/profile`, { headers: this.headers }).subscribe({
      next: (data) => {
        this.matricule.set(data.etudiant?.matricule ?? '—');
        this.dateNaissance.set(data.etudiant?.dateNaissance ?? '—');
        this.lieuNaissance.set(data.etudiant?.lieuNaissance ?? '—');
        this.filiere.set(data.etudiant?.filiere ?? '—');
        this.classe.set(data.etudiant?.classe ?? '—');
        this.nomEdite = data.nom ?? '';
        this.prenomEdite = data.prenom ?? '';
        this.dateNaissanceEditee = data.etudiant?.dateNaissance ?? '';
        this.lieuNaissanceEdite = data.etudiant?.lieuNaissance ?? '';
        this.sexeEdite = data.etudiant?.sexe ?? '';
        this.telephoneEdite = data.telephone ?? '';
        this.emailActuel.set(data.email ?? '');
        this.emailEdite = data.email ?? '';
      },
      error: () => { }
    });

    this.http.get<any[]>(`${this.apiUrl}/semestres`, { headers: this.headers }).subscribe({
      next: (data) => {
        this.semestresApi.set(Array.isArray(data) ? data : []);
        const sems = this.semestres();
        if (sems.length > 0) {
          this.semestreSelectionneCode.set(sems[sems.length - 1].code);
        }
      },
      error: () => { }
    });

    this.http.get<any>(`${this.apiUrl}/notes`, { headers: this.headers }).subscribe({
      next: (data) => {
        const notes = Array.isArray(data) ? data : (data?.notes ?? []);
        this.notesApi.set(notes);
      },
      error: () => this.notesApi.set([])
    });

    // Pré-chargement des bulletins pour la moyenne
    this.http.get<any>(`${this.apiUrl}/bulletins/mes-bulletins`, { headers: this.headers }).subscribe({
      next: (data) => this.bulletinsCache.set(data.bulletins ?? []),
      error: () => {}
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

    const code = this.semestreSelectionneCode();
    const note = this.notesApi().find(n =>
      n.semestre?.libelle === code &&
      (n.matiere?.libelle ?? '—') === matiere &&
      (n.type ?? n.evaluation?.typeEvaluation ?? '—') === type
    );

    if (note) {
      this.http.post(`${this.apiUrl}/reclamations`, {
        note_id: note.id,
        motif: this.motifReclamation,
      }, { headers: this.headers }).subscribe({
        next: () => {
          this.reclamationsEnvoyees.update(set => {
            const copie = new Set(set);
            copie.add(this.cleLigne(matiere, type));
            return copie;
          });
          this.reclamationOuverte.set(null);
        },
        error: (e) => console.error(e)
      });
    }
  }

  protected estReclamee(matiere: string, type: string): boolean {
    return this.reclamationsEnvoyees().has(this.cleLigne(matiere, type));
  }

  protected reinitialiser(): void {
    const sems = this.semestres();
    if (sems.length > 0) this.semestreSelectionneCode.set(sems[sems.length - 1].code);
    this.reclamationOuverte.set(null);
  }

  protected enregistrerProfil(): void {
    this.http.put(`${this.apiUrl}/profile`, {
      nom: this.nomEdite,
      prenom: this.prenomEdite,
      dateNaissance: this.dateNaissanceEditee,
      lieuNaissance: this.lieuNaissanceEdite,
      sexe: this.sexeEdite,
      telephone: this.telephoneEdite,
    }, { headers: this.headers }).subscribe({
      next: () => {
        this.nomEtudiant.set(`${this.prenomEdite} ${this.nomEdite}`.trim());
        localStorage.setItem('nom', this.nomEdite);
        localStorage.setItem('prenom', this.prenomEdite);
        this.profilEnEdition.set(false);
        this.http.get<any>(`${this.apiUrl}/profile`, { headers: this.headers }).subscribe({
          next: (data) => {
            this.matricule.set(data.etudiant?.matricule ?? '—');
            this.dateNaissance.set(data.etudiant?.dateNaissance ?? '—');
            this.lieuNaissance.set(data.etudiant?.lieuNaissance ?? '—');
            this.filiere.set(data.etudiant?.filiere ?? '—');
            this.classe.set(data.etudiant?.classe ?? '—');
            this.dateNaissanceEditee = data.etudiant?.dateNaissance ?? '';
            this.lieuNaissanceEdite = data.etudiant?.lieuNaissance ?? '';
            this.sexeEdite = data.etudiant?.sexe ?? '';
            this.telephoneEdite = data.telephone ?? '';
          },
          error: () => { }
        });
      },
      error: () => { }
    });
  }

  protected chargerReclamations(): void {
    this.http.get<any[]>(`${this.apiUrl}/reclamations/mes-reclamations`, { headers: this.headers }).subscribe({
      next: (data) => this.mesReclamations.set(Array.isArray(data) ? data : []),
      error: () => { }
    });
  }

  protected relancerReclamation(id: number): void {
    this.http.post(`${this.apiUrl}/reclamations/${id}/relancer`, {}, { headers: this.headers }).subscribe({
      next: () => this.chargerReclamations(),
      error: (e) => console.error(e)
    });
  }

  protected enregistrerSecurite(): void {
    this.securiteErreur.set(null);
    this.securiteSucces.set(false);
    if (this.motDePasseEdite && this.motDePasseEdite !== this.motDePasseConfirme) {
      this.securiteErreur.set('Les mots de passe ne correspondent pas.');
      return;
    }
    const body: any = {};
    if (this.emailEdite && this.emailEdite !== this.emailActuel()) {
      body.email = this.emailEdite;
    }
    if (this.motDePasseEdite) {
      body.password = this.motDePasseEdite;
      body.password_confirmation = this.motDePasseConfirme;
    }
    if (Object.keys(body).length === 0) {
      this.securiteEnEdition.set(false);
      return;
    }
    this.http.put(`${this.apiUrl}/profile`, body, { headers: this.headers }).subscribe({
      next: () => {
        if (body.email) this.emailActuel.set(body.email);
        this.motDePasseEdite = '';
        this.motDePasseConfirme = '';
        this.securiteSucces.set(true);
        setTimeout(() => { this.securiteEnEdition.set(false); this.securiteSucces.set(false); }, 1500);
      },
      error: (e) => {
        this.securiteErreur.set(e.error?.message ?? 'Erreur lors de la mise à jour.');
      }
    });
  }

  protected voirBulletin(): void {
    const semestreCode = this.semestreSelectionneCode();
    this.bulletinChargement.set(true);
    this.bulletinOuvert.set(true);
    this.bulletinData.set(null);

    this.http.get<any>(`${this.apiUrl}/bulletins/mes-bulletins`, { headers: this.headers })
      .subscribe({
        next: (data) => {
          const bulletins = data.bulletins ?? [];
          let bulletin = null;
          if (semestreCode) {
            bulletin = bulletins.find((b: any) => b.semestre?.libelle === semestreCode);
          }
          if (!bulletin && bulletins.length > 0) {
            bulletin = bulletins[0];
          }
          this.bulletinData.set(bulletin ?? null);
          this.bulletinChargement.set(false);
        },
        error: () => {
          this.bulletinData.set(null);
          this.bulletinChargement.set(false);
        }
      });
  }

  protected fermerBulletin(): void {
    this.bulletinOuvert.set(false);
    this.bulletinData.set(null);
  }

  protected async telechargerPDF(): Promise<void> {
    const element = document.getElementById('contenu-bulletin');
    if (!element) return;
    this.pdfEnCours.set(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const nom = this.nomEtudiant() || 'bulletin';
      const semestre = this.bulletinData()?.semestre?.libelle ?? 'semestre';
      pdf.save(`bulletin_${nom}_${semestre}.pdf`.replace(/\s+/g, '_'));
    } finally {
      this.pdfEnCours.set(false);
    }
  }
}