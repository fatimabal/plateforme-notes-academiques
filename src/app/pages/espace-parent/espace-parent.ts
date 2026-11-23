import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../core/notification.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-espace-parent',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './espace-parent.html',
  styleUrl: '../espace-scolarite/espace-scolarite.scss',
})
export class EspaceParent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api';

  protected readonly notif = inject(NotificationService);
  protected readonly afficherNotifs = signal(false);

  protected readonly nomParent = `${localStorage.getItem('prenom') ?? ''} ${localStorage.getItem('nom') ?? ''}`.trim() || 'Parent';

  protected readonly notes = signal<any[]>([]);
  protected readonly bulletins = signal<any[]>([]);
  protected readonly semestreSelectionne = signal<string>('tous');
  protected readonly bulletinVu = signal<any>(null);
  protected readonly pdfEnCours = signal(false);

  protected readonly semestres = computed(() => {
    const tous = this.notes()
      .map(n => n.semestre)
      .filter(s => s != null);
    const uniques = new Map<number, any>();
    for (const s of tous) uniques.set(s.id, s);
    return Array.from(uniques.values()).sort((a, b) => a.id - b.id);
  });

  protected readonly notesFiltrees = computed(() => {
    const sel = this.semestreSelectionne();
    if (sel === 'tous') return this.notes();
    return this.notes().filter(n => n.semestre?.id === +sel);
  });

  protected readonly moyenneGenerale = computed(() => {
    // Si un bulletin existe pour le semestre sélectionné, utiliser sa moyenne
    const sel = this.semestreSelectionne();
    const bulletins = this.bulletins();
    if (bulletins.length > 0) {
      let bulletin = null;
      if (sel === 'tous') {
        bulletin = bulletins[bulletins.length - 1];
      } else {
        bulletin = bulletins.find(b => b.semestre?.id?.toString() === sel);
      }
      if (bulletin?.moyenne_generale != null) {
        return bulletin.moyenne_generale;
      }
    }
    // Sinon calculer depuis les notes
    const n = this.notesFiltrees();
    if (!n.length) return 0;
    const valides = n.filter(note => note.valeur != null && !isNaN(Number(note.valeur)));
    if (!valides.length) return 0;
    const total = valides.reduce((s, note) => s + Number(note.valeur), 0);
    return Math.round((total / valides.length) * 100) / 100;
  });

  ngOnInit(): void {
    this.chargerNotes();
    this.chargerBulletins();
    this.notif.charger();
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  private chargerNotes(): void {
    this.http.get<any>(`${this.apiUrl}/notes/enfant`, { headers: this.headers() })
      .subscribe({
        next: (d) => {
          const liste = Array.isArray(d) ? d : (d.data ?? d.notes ?? []);
          this.notes.set(liste);
        },
        error: () => {}
      });
  }

  private chargerBulletins(): void {
    this.http.get<any>(`${this.apiUrl}/bulletins/enfant`, { headers: this.headers() })
      .subscribe({
        next: (d) => {
          const liste = Array.isArray(d) ? d : (d.data ?? d.bulletins ?? []);
          this.bulletins.set(liste);
        },
        error: () => {}
      });
  }

  protected async telechargerPDF(): Promise<void> {
    const element = document.getElementById('contenu-bulletin-parent');
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
      const nom = b?.infos_etudiant?.matricule ?? 'bulletin';
      const semestre = b?.semestre?.libelle ?? 'semestre';
      pdf.save(`bulletin_${nom}_${semestre}.pdf`.replace(/\s+/g, '_'));
    } finally {
      this.pdfEnCours.set(false);
    }
  }
}