export interface StatsClasse {
  classe: string;
  etudiants: number;
  moyenne: number;
}

export interface StatsModule {
  module: string;
  notes: number;
  moyenne: number;
}

export interface TrancheDistribution {
  tranche: string;
  count: number;
}

export interface TableauBordPedagogique {
  tauxReussite: number;
  etudiantsEvalues: number;
  moyenneGenerale: number;
  reclamationsTraitees: number;
  reclamationsTotal: number;
  moyennesParClasse: StatsClasse[];
  distribution: TrancheDistribution[];
  moyennesParModule: StatsModule[];
}