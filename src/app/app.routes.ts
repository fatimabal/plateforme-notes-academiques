import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Inscription } from './pages/inscription/inscription';
import { EspaceParent } from './pages/espace-parent/espace-parent';
import { EspaceEtudiant } from './pages/espace-etudiant/espace-etudiant';
import { EspaceEnseignant } from './pages/espace-enseignant/espace-enseignant';
import { EspaceComptabilite } from './pages/espace-comptabilite/espace-comptabilite';
import { EspaceExamens } from './pages/espace-examens/espace-examens';
import { EspaceChefDepartement } from './pages/espace-chef-departement/espace-chef-departement';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'inscription', component: Inscription },
  { path: 'espace-parent', component: EspaceParent },
  { path: 'espace-enseignant', component: EspaceEnseignant },
  { path: 'espace-etudiant', component: EspaceEtudiant },
  { path: 'espace-comptabilite', component: EspaceComptabilite },
  { path: 'espace-examens', component: EspaceExamens },
  { path: 'espace-chef-departement', component: EspaceChefDepartement },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];