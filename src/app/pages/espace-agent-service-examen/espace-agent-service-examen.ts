import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExamensData } from '../../core/examens-data';
import { NotificationService } from '../../core/notification.service';
import { HttpClientModule } from '@angular/common/http';
@Component({
  selector: 'app-espace-agent-service-examen',
  imports: [CommonModule, RouterLink,HttpClientModule],
  templateUrl: './espace-agent-service-examen.html',
  styleUrl: './espace-agent-service-examen.scss',
})
export class EspaceAgentServiceExamen {
  protected readonly data = inject(ExamensData);

  protected readonly nomService = 'Service des Examens';

  protected readonly semestres = this.data.semestres;
  protected readonly semestreSelectionne = signal(this.semestres[this.semestres.length - 2]); // L3-S1 par defaut

  protected readonly deliberation = computed(() =>
    this.data.getDeliberation(this.semestreSelectionne())
  );

  protected readonly toutEstDelibere = computed(() => {
    const lignes = this.deliberation().lignes as Array<{ decision: string }>;
    return lignes.length > 0 && lignes.every((l: { decision: string }) => l.decision === 'delibere');
  });

  protected selectionnerSemestre(semestre: string): void {
    this.semestreSelectionne.set(semestre);
  }

  protected lancerDeliberation(): void {
    this.data.lancerDeliberation(this.semestreSelectionne());
  }
  protected readonly notif = inject(NotificationService);
protected afficherNotifs = signal(false);

constructor() {
  this.notif.charger();
}
}