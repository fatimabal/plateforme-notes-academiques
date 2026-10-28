import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-espace-agent-service-examen',
  imports: [CommonModule, RouterLink],
  templateUrl: './espace-agent-service-examen.html',
  styleUrl: './espace-agent-service-examen.scss',
})
export class EspaceAgentServiceExamen implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api';
  protected readonly notif = inject(NotificationService);
  protected afficherNotifs = signal(false);

  protected readonly nomService = 'Service des Examens';

  private readonly toutesLesNotes = signal<any[]>([]);

  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  protected readonly semestres = computed(() => {
    const s = new Set<string>();
    for (const n of this.toutesLesNotes()) {
      const sem = n.semestre?.libelle ?? n.evaluation?.semestre?.libelle;
      if (sem) s.add(sem);
    }
    return s.size > 0 ? Array.from(s) : [];
  });

  protected readonly semestreSelectionne = signal('');

  protected readonly deliberation = computed(() => {
    const sem = this.semestreSelectionne();
    const notes = this.toutesLesNotes().filter(n => {
      const s = n.semestre?.libelle ?? n.evaluation?.semestre?.libelle;
      return s === sem;
    });

    const parEtudiant = new Map<number, any>();
    for (const n of notes) {
      const id = n.etudiant_id;
      if (!parEtudiant.has(id)) {
        parEtudiant.set(id, {
          etudiant: `${n.etudiant?.user?.prenom ?? ''} ${n.etudiant?.user?.nom ?? ''}`.trim() || '—',
          classe: (n.etudiant?.inscription as any[])?.[0]?.classe?.nomClasse ?? '—',
          valeurs: [],
          decision: 'attente',
        });
      }
      parEtudiant.get(id).valeurs.push(Number(n.valeur));
    }

    const lignes = Array.from(parEtudiant.values()).map(e => {
      const moyenne = e.valeurs.length
        ? Math.round((e.valeurs.reduce((a: number, b: number) => a + b, 0) / e.valeurs.length) * 10) / 10
        : 0;
      const observation = moyenne >= 10 ? 'Admis(e)' : 'Ajourné(e)';
      return {
        etudiant: e.etudiant,
        classe: e.classe,
        notesPubliees: e.valeurs.length,
        notesAttendues: e.valeurs.length,
        moyenne,
        decision: e.decision,
        observation,
      };
    });

    return { semestre: sem, lignes };
  });

  protected readonly toutEstDelibere = computed(() => {
    const lignes = this.deliberation().lignes;
    return lignes.length > 0 && lignes.every(l => l.decision === 'delibere');
  });

  ngOnInit(): void {
    this.notif.charger();
    this.http.get<any[]>(`${this.apiUrl}/notes/toutes`, { headers: this.headers }).subscribe({
      next: (data) => {
        this.toutesLesNotes.set(Array.isArray(data) ? data : []);
        const sems = this.semestres();
        if (sems.length > 0) this.semestreSelectionne.set(sems[0]);
      },
      error: () => this.toutesLesNotes.set([])
    });
  }

  protected selectionnerSemestre(semestre: string): void {
    this.semestreSelectionne.set(semestre);
  }

  protected lancerDeliberation(): void {
    this.toutesLesNotes.update(notes => notes.map(n => {
      const s = n.semestre?.libelle ?? n.evaluation?.semestre?.libelle;
      return s === this.semestreSelectionne() ? { ...n, _delibere: true } : n;
    }));
  }
}