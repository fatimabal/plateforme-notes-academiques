import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InscriptionApi } from '../../core/inscription-api';
import { RoleInscriptible } from '../../core/models/utilisateur.model';

function motsDePasseIdentiques(control: AbstractControl): ValidationErrors | null {
  const motDePasse = control.get('motDePasse')?.value;
  const confirmation = control.get('confirmation')?.value;
  return motDePasse && confirmation && motDePasse !== confirmation
    ? { motsDePasseDifferents: true }
    : null;
}

@Component({
  selector: 'app-inscription',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './inscription.html',
  styleUrl: './inscription.scss',
})
export class Inscription {
  private readonly fb = inject(FormBuilder);
  private readonly inscriptionApi = inject(InscriptionApi);

  protected readonly roleSelectionne = signal<RoleInscriptible>('etudiant');
  protected readonly isSubmitting = signal(false);
  protected readonly compteCree = signal(false);

  protected readonly form = this.fb.group(
    {
      nomComplet: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(4)]],
      confirmation: ['', [Validators.required]],
    },
    { validators: motsDePasseIdentiques }
  );

  protected choisirRole(role: RoleInscriptible): void {
    this.roleSelectionne.set(role);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const { nomComplet, email, motDePasse } = this.form.getRawValue();

    this.inscriptionApi
      .creerCompte({
        nomComplet: nomComplet!,
        email: email!,
        motDePasse: motDePasse!,
        role: this.roleSelectionne(),
      })
      .subscribe(() => {
        this.isSubmitting.set(false);
        this.compteCree.set(true);
      });
  }
}