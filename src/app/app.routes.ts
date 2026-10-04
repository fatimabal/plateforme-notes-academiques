import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Inscription } from './pages/inscription/inscription';
import { EspaceParent } from './pages/espace-parent/espace-parent';
import { EspaceEtudiant } from './pages/espace-etudiant/espace-etudiant';
import { EspaceEnseignant } from './pages/espace-enseignant/espace-enseignant';
import { EspaceComptabilite } from './pages/espace-comptabilite/espace-comptabilite';
import { EspaceAgentServiceExamen } from './pages/espace-agent-service-examen/espace-agent-service-examen';
import { EspaceChefDepartement } from './pages/espace-chef-departement/espace-chef-departement';
import { EspaceAdmin } from './pages/espace-admin/espace-admin';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'inscription', component: Inscription },
  { path: 'espace-parent', component: EspaceParent, canActivate: [authGuard] },
  { path: 'espace-enseignant', component: EspaceEnseignant, canActivate: [authGuard] },
  { path: 'espace-etudiant', component: EspaceEtudiant, canActivate: [authGuard] },
  { path: 'espace-comptabilite', component: EspaceComptabilite, canActivate: [authGuard] },
  { path: 'espace-agent-service-examen', component: EspaceAgentServiceExamen, canActivate: [authGuard] },
  { path: 'espace-chef-departement', component: EspaceChefDepartement, canActivate: [authGuard] },
  { path: 'espace-admin', component: EspaceAdmin, canActivate: [authGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];