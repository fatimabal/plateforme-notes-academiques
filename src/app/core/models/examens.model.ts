export type DecisionDeliberation = 'nonDelibere' | 'delibere';

export interface LigneDeliberation {
  etudiant: string;
  classe: string;
  notesPubliees: number;
  notesAttendues: number;
  moyenne: number;
  decision: DecisionDeliberation;
  observation: string;
}

export interface DeliberationSemestre {
  semestre: string;
  lignes: LigneDeliberation[];
}