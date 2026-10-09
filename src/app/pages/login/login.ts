import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly motDePasseVisible = signal(false);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required, Validators.minLength(4)]],
  });

  protected basculerVisibiliteMotDePasse(): void {
    this.motDePasseVisible.update((v) => !v);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    const { email, motDePasse } = this.form.getRawValue();

    this.auth.login({ email: email!, motDePasse: motDePasse! }).subscribe({
      next: (session: any) => {
        this.isSubmitting.set(false);
        // Sauvegarder le token
        localStorage.setItem('token', session.token);
        localStorage.setItem('role', session.user.role);
        // Rediriger selon le rôle
        this.redirectByRole(session.user.role);
      },
      error: (err: Error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.message);
      },
    });
    
  }
  private redirectByRole(role: string): void {
    switch(role) {
        case 'etudiant':
            this.router.navigate(['/espace-etudiant']);
            break;
        case 'enseignant':
            this.router.navigate(['/espace-enseignant']);
            break;
        case 'scolarite':
            this.router.navigate(['/espace-agent-service-examen']);
            break;
        case 'parent':
            this.router.navigate(['/espace-parent']);
            break;
        case 'comptable':
            this.router.navigate(['/espace-comptabilite']);
            break;
        case 'chef_departement':
            this.router.navigate(['/espace-chef-departement']);
            break;
        case 'admin':
            this.router.navigate(['/espace-admin']);
            break;
        default:
            this.router.navigate(['/login']);
    }
}
}