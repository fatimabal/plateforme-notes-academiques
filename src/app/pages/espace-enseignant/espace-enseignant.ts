import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EnseignantData } from '../../core/enseignant-data';

@Component({
  selector: 'app-espace-enseignant',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './espace-enseignant.html',
  styleUrl: './espace-enseignant.scss',
})
export class EspaceEnseignant {
  protected readonly data = inject(EnseignantData);
  private readonly fb = inject(FormBuilder);

  protected readonly nomEnseignant = 'Pr. Karim Mansour';

  protected readonly matieres = this.data.matieres;
  protected readonly etudiants = this.data.etudiants;
  protected readonly typesEvaluation = this.data.typesEvaluation;
  protected readonly semestres = this.data.semestres;

  protected readonly form = this.fb.group({
    matiere: [this.matieres[0], Validators.required],
    etudiant: [this.etudiants[0], Validators.required],
    type: [this.typesEvaluation[0], Validators.required],
    semestre: [this.semestres[this.semestres.length - 1], Validators.required],
    note: [null as number | null, [Validators.required, Validators.min(0), Validators.max(20)]],
    coefficient: [1, [Validators.required, Validators.min(1)]],
  });

  // Edition en ligne d'une note existante
  protected readonly noteEnEdition = signal<string | null>(null);
  protected noteEditee: number | null = null;
  protected coefficientEdite: number | null = null;

  protected enregistrerBrouillon(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valeurs = this.form.getRawValue();

    this.data.enregistrerBrouillon({
      matiere: valeurs.matiere!,
      etudiant: valeurs.etudiant!.replace(/\s*\(.*\)$/, ''), // enleve "(L3 GL)"
      type: valeurs.type!,
      semestre: valeurs.semestre!,
      note: valeurs.note!,
      coefficient: valeurs.coefficient!,
    });

    this.form.patchValue({ note: null, coefficient: 1 });
  }

  protected ouvrirEdition(id: string, noteActuelle: number, coefficientActuel: number): void {
    this.noteEnEdition.set(id);
    this.noteEditee = noteActuelle;
    this.coefficientEdite = coefficientActuel;
  }

  protected annulerEdition(): void {
    this.noteEnEdition.set(null);
  }

  protected enregistrerEdition(id: string): void {
    if (this.noteEditee === null || this.coefficientEdite === null) return;
    this.data.modifierNote(id, this.noteEditee, this.coefficientEdite);
    this.noteEnEdition.set(null);
  }
}