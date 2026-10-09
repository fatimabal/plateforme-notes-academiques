import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import type { TableauBordPedagogique } from './models/chef-departement.model';

@Injectable({ providedIn: 'root' })
export class ChefDepartementData {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  readonly semestres = ['L1-S1', 'L1-S2', 'L2-S1', 'L2-S2', 'L3-S1', 'L3-S2'];

  private readonly tableauxBord: Record<string, TableauBordPedagogique> = {
    'L1-S1': {
      tauxReussite: 78,
      etudiantsEvalues: 185,
      moyenneGenerale: 13.4,
      reclamationsTraitees: 18,
      reclamationsTotal: 24,
      moyennesParClasse: [
        { classe: 'L1-A', etudiants: 62, moyenne: 13.8 },
        { classe: 'L1-B', etudiants: 58, moyenne: 12.9 },
        { classe: 'L1-C', etudiants: 65, moyenne: 13.1 }
      ],
      distribution: [
        { tranche: '< 10', count: 18 },
        { tranche: '10-12', count: 41 },
        { tranche: '12-14', count: 63 },
        { tranche: '14-16', count: 46 },
        { tranche: '16+', count: 17 }
      ],
      moyennesParModule: [
        { module: 'Algorithmique', notes: 42, moyenne: 14.6 },
        { module: 'Programmation', notes: 38, moyenne: 14.1 },
        { module: 'Math?matiques', notes: 35, moyenne: 12.7 },
        { module: 'R?seaux', notes: 31, moyenne: 13.4 }
      ]
    },
    'L1-S2': {
      tauxReussite: 81,
      etudiantsEvalues: 192,
      moyenneGenerale: 14.1,
      reclamationsTraitees: 20,
      reclamationsTotal: 27,
      moyennesParClasse: [
        { classe: 'L1-A', etudiants: 64, moyenne: 14.5 },
        { classe: 'L1-B', etudiants: 60, moyenne: 13.8 },
        { classe: 'L1-C', etudiants: 68, moyenne: 14.0 }
      ],
      distribution: [
        { tranche: '< 10', count: 15 },
        { tranche: '10-12', count: 36 },
        { tranche: '12-14', count: 58 },
        { tranche: '14-16', count: 52 },
        { tranche: '16+', count: 31 }
      ],
      moyennesParModule: [
        { module: 'Bases de donn?es', notes: 44, moyenne: 14.8 },
        { module: 'Structures de donn?es', notes: 39, moyenne: 14.3 },
        { module: 'Anglais', notes: 41, moyenne: 13.9 },
        { module: 'Analyse', notes: 37, moyenne: 13.6 }
      ]
    },
    'L2-S1': {
      tauxReussite: 84,
      etudiantsEvalues: 178,
      moyenneGenerale: 14.6,
      reclamationsTraitees: 23,
      reclamationsTotal: 29,
      moyennesParClasse: [
        { classe: 'L2-A', etudiants: 59, moyenne: 14.9 },
        { classe: 'L2-B', etudiants: 61, moyenne: 14.4 },
        { classe: 'L2-C', etudiants: 58, moyenne: 14.7 }
      ],
      distribution: [
        { tranche: '< 10', count: 12 },
        { tranche: '10-12', count: 31 },
        { tranche: '12-14', count: 54 },
        { tranche: '14-16', count: 58 },
        { tranche: '16+', count: 23 }
      ],
      moyennesParModule: [
        { module: 'Java', notes: 45, moyenne: 15.2 },
        { module: 'UML', notes: 40, moyenne: 14.5 },
        { module: 'Syst?mes', notes: 42, moyenne: 14.9 },
        { module: 'Probabilit?s', notes: 36, moyenne: 13.8 }
      ]
    },
    'L2-S2': {
      tauxReussite: 86,
      etudiantsEvalues: 181,
      moyenneGenerale: 15.1,
      reclamationsTraitees: 25,
      reclamationsTotal: 32,
      moyennesParClasse: [
        { classe: 'L2-A', etudiants: 60, moyenne: 15.3 },
        { classe: 'L2-B', etudiants: 62, moyenne: 14.8 },
        { classe: 'L2-C', etudiants: 59, moyenne: 15.2 }
      ],
      distribution: [
        { tranche: '< 10', count: 10 },
        { tranche: '10-12', count: 27 },
        { tranche: '12-14', count: 48 },
        { tranche: '14-16', count: 62 },
        { tranche: '16+', count: 34 }
      ],
      moyennesParModule: [
        { module: 'Web', notes: 46, moyenne: 15.7 },
        { module: 'Algorithmique avanc?e', notes: 43, moyenne: 15.1 },
        { module: 'BD avanc?es', notes: 41, moyenne: 14.8 },
        { module: 'Statistiques', notes: 38, moyenne: 14.2 }
      ]
    },
    'L3-S1': {
      tauxReussite: 88,
      etudiantsEvalues: 174,
      moyenneGenerale: 15.7,
      reclamationsTraitees: 27,
      reclamationsTotal: 34,
      moyennesParClasse: [
        { classe: 'L3-A', etudiants: 58, moyenne: 16.0 },
        { classe: 'L3-B', etudiants: 56, moyenne: 15.6 },
        { classe: 'L3-C', etudiants: 60, moyenne: 15.5 }
      ],
      distribution: [
        { tranche: '< 10', count: 8 },
        { tranche: '10-12', count: 23 },
        { tranche: '12-14', count: 42 },
        { tranche: '14-16', count: 67 },
        { tranche: '16+', count: 34 }
      ],
      moyennesParModule: [
        { module: 'Architecture logicielle', notes: 50, moyenne: 16.2 },
        { module: 'Intelligence artificielle', notes: 48, moyenne: 15.9 },
        { module: 'S?curit?', notes: 46, moyenne: 15.4 },
        { module: 'Gestion de projet', notes: 44, moyenne: 15.1 }
      ]
    },
    'L3-S2': {
      tauxReussite: 91,
      etudiantsEvalues: 169,
      moyenneGenerale: 16.3,
      reclamationsTraitees: 29,
      reclamationsTotal: 35,
      moyennesParClasse: [
        { classe: 'L3-A', etudiants: 56, moyenne: 16.5 },
        { classe: 'L3-B', etudiants: 55, moyenne: 16.1 },
        { classe: 'L3-C', etudiants: 58, moyenne: 16.4 }
      ],
      distribution: [
        { tranche: '< 10', count: 6 },
        { tranche: '10-12', count: 19 },
        { tranche: '12-14', count: 39 },
        { tranche: '14-16', count: 69 },
        { tranche: '16+', count: 36 }
      ],
      moyennesParModule: [
        { module: 'Stage', notes: 52, moyenne: 16.8 },
        { module: 'M?thodes agiles', notes: 49, moyenne: 16.5 },
        { module: 'Big Data', notes: 47, moyenne: 16.1 },
        { module: 'Innovation', notes: 45, moyenne: 15.7 }
      ]
    }
  };

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  getDepartements(): Observable<any> {
    return this.http.get(`${this.apiUrl}/departements`, { headers: this.getHeaders() });
  }

  getFilieres(): Observable<any> {
    return this.http.get(`${this.apiUrl}/filieres`, { headers: this.getHeaders() });
  }

  getClasses(): Observable<any> {
    return this.http.get(`${this.apiUrl}/classes`, { headers: this.getHeaders() });
  }

  getEnseignants(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`, { headers: this.getHeaders() });
  }

  getTableauBord(semestre: string): TableauBordPedagogique {
    return this.tableauxBord[semestre] ?? this.tableauxBord['L3-S1'];
  }
}
