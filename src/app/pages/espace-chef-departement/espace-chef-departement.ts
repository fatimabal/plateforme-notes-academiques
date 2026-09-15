import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChefDepartementData } from '../../core/chef-departement-data';

const SEUIL_DIFFICULTE = 13;

@Component({
  selector: 'app-espace-chef-departement',
  imports: [CommonModule, RouterLink],
  templateUrl: './espace-chef-departement.html',
  styleUrl: './espace-chef-departement.scss',
})
export class EspaceChefDepartement {
  private readonly data = inject(ChefDepartementData);

  protected readonly nomChef = 'Dr. Hedi Gharbi';
  protected readonly semestres = this.data.semestres;
  protected readonly semestreSelectionne = signal(this.semestres[0]); // "Tous" par defaut

  protected readonly tableauBord = computed(() =>
    this.data.getTableauBord(this.semestreSelectionne())
  );

  protected readonly maxDistribution = computed(() => {
    const t = this.tableauBord();
    if (!t) return 1;
    return Math.max(1, ...t.distribution.map((d) => d.count));
  });

  protected readonly meilleuresPerformances = computed(() => {
    const t = this.tableauBord();
    if (!t) return [];
    return [...t.moyennesParModule].sort((a, b) => b.moyenne - a.moyenne);
  });

  protected readonly modulesLesPlusFaibles = computed(() => {
    const t = this.tableauBord();
    if (!t) return [];
    return [...t.moyennesParModule].sort((a, b) => a.moyenne - b.moyenne);
  });

  protected readonly classesEnDifficulte = computed(() => {
    const t = this.tableauBord();
    if (!t) return [];
    return t.moyennesParClasse.filter((c) => c.moyenne < SEUIL_DIFFICULTE);
  });

  protected selectionnerSemestre(semestre: string): void {
    this.semestreSelectionne.set(semestre);
  }

  protected largeurBarre(count: number): number {
    return (count / this.maxDistribution()) * 100;
  }
}