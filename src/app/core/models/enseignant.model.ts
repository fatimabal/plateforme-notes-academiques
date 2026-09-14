export type StatutNote = 'brouillon' | 'validee' | 'publiee';

export interface NoteEnseignant {
  id: string;
  etudiant: string;
  matiere: string;
  type: string;
  semestre: string;
  note: number;
  coefficient: number;
  statut: StatutNote;
  reclamee: boolean;
}

export interface SaisieNote {
  matiere: string;
  etudiant: string;
  type: string;
  semestre: string;
  note: number;
  coefficient: number;
}

export interface ReclamationRecue {
  id: string;
  etudiant: string;
  matiere: string;
  type: string;
  motif: string;
  statut: 'ouverte' | 'traitee';
}