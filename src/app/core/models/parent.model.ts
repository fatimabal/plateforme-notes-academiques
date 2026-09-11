export interface Enfant {
  id: string;
  nom: string;
  filiere: string;
  semestreCourant: string;
}

export interface Note {
  matiere: string;
  type: string;
  note: number;
  coefficient: number;
}

export interface SemestreNotes {
  semestre: string;
  moyenne: number;
  lignes: Note[];
}

export interface DossierEnfant {
  enfant: Enfant;
  semestres: SemestreNotes[];
}

export interface Commentaire {
  id: string;
  texte: string;
  date: Date;
}