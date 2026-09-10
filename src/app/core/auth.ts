import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Credentials, SessionUtilisateur } from './models/utilisateur.model';


@Injectable({ providedIn: 'root' })
export class Auth {
  login(credentials: Credentials): Observable<SessionUtilisateur> {
    const emailValide = /.+@.+\..+/.test(credentials.email);

    if (!emailValide || credentials.motDePasse.length < 4) {
      return throwError(() => new Error('Identifiants incorrects. Vérifiez votre adresse e-mail et votre mot de passe.')).pipe(
        delay(600)
      );
    }

    const session: SessionUtilisateur = {
      token: 'jeton-simule',
      role: 'etudiant',
      nom: 'Diop',
      prenom: 'Awa',
    };

    return of(session).pipe(delay(700));
  }
}