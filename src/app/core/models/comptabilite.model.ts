export type SituationFinanciere = 'aJour' | 'soldeDu';

export interface DossierFinancier {
  id: string;
  etudiant: string;
  classe: string;
  frais: number;
  paye: number;
}