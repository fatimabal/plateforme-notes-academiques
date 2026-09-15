import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExamensData } from '../../core/examens-data';

@Component({
  selector: 'app-espace-examens',
  imports: [CommonModule, RouterLink],
  templateUrl: './espace-examens.html',
  styleUrl: './espace-examens.scss',
})
export class EspaceExamens {
  protected readonly data = inject(ExamensData);

  protected readonly nomService = 'Service des Examens';

  protected readonly semestres = this.data.semestres;
  protected readonly semestreSelectionne = signal(this.semestres[this.semestres.length - 2]); // L3-S1 par defaut

  protected readonly deliberation = computed(() =>
    this.data.getDeliberation(this.semestreSelectionne())
  );

  protected readonly toutEstDelibere = computed(() => {
    const lignes = this.deliberation().lignes;
    return lignes.length > 0 && lignes.every((l) => l.decision === 'delibere');
  });

  protected selectionnerSemestre(semestre: string): void {
    this.semestreSelectionne.set(semestre);
  }

  protected lancerDeliberation(): void {
    this.data.lancerDeliberation(this.semestreSelectionne());
  }
}