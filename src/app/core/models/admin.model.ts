export interface CompteUtilisateur {
  id: string;
  nom: string;
  email: string;
  role: string;
  details: string;
  peutSupprimer: boolean;
}

export interface EntreeAudit {
  id: string;
  date: string;
  acteur: string;
  role: string;
  action: string;
  cible: string;
  details: string;
}