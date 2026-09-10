export type RoleUtilisateur =
  | 'etudiant'
  | 'enseignant'
  | 'parent'
  | 'chefDepartement'
  | 'serviceExamens'
  | 'admin'
  | 'comptabilite';

export interface Credentials {
  email: string;
  motDePasse: string;
}

export interface SessionUtilisateur {
  token: string;
  role: RoleUtilisateur;
  nom: string;
  prenom: string;
}