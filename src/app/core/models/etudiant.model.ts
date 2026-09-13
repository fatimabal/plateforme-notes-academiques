export interface Evaluation {
  type: string;
  note: number;
  coefficient: number;
  date: string;
}

export interface ModuleNotes {
  matiere: string;
  moyenne: number;
  evaluations: Evaluation[];
}

export interface SemestreEtudiant {
  code: string;
  label: string;
  actuel: boolean;
  moyenne: number | null;
  modules: ModuleNotes[];
}

export interface ProfilEtudiant {
  nom: string;
  classe: string;
  semestres: SemestreEtudiant[];
}