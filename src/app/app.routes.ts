import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Inscription } from './pages/inscription/inscription';
import { EspaceParent } from './pages/espace-parent/espace-parent';
import { EspaceEtudiant } from './pages/espace-etudiant/espace-etudiant';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'inscription', component: Inscription },
  { path: 'espace-parent', component: EspaceParent },
  { path: 'espace-etudiant', component: EspaceEtudiant },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];