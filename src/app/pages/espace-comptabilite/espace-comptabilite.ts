import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ComptabiliteData } from '../../core/comptabilite-data';

@Component({
  selector: 'app-espace-comptabilite',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './espace-comptabilite.html',
  styleUrl: './espace-comptabilite.scss',
})
export class EspaceComptabilite {
  protected readonly data = inject(ComptabiliteData);
  protected readonly nomService = 'Service Comptabilité';
  protected montants: Record<string, number | null> = {};

  protected reste(d: any): number {
    return Math.max(0, d.frais - d.paye);
  }

  protected estAJour(d: any): boolean {
    return d.paye >= d.frais;
  }

  protected encaisser(d: any): void {
    const montant = this.montants[d.id];
    if (!montant || montant <= 0) return;
    this.data.encaisser(d.id, montant);
    this.montants[d.id] = null;
  }
}