import {ChangeDetectorRef, Injectable} from '@angular/core';
import {Auth} from 'aws-amplify';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loggedIn: boolean = true;
  private id: number = 0;
  private nickname: string = ''

  get isLoggedIn(): boolean {
    return this.loggedIn;
  }

  get visibleName(): string {
    return this.nickname;
  }

  get userId(): number {
    return this.id;
  }

  constructor() {}

  login(username: string, password: string) {
    console.log("Logging in username: " + username + ", password: " + password);
    return this.loginWithCognito(username, password);
  }

  checkLoggedIn() {
    return Auth.currentSession()
      .then(user => {
        console.log(user);
        // tslint:disable-next-line
        this.nickname = user.getIdToken().payload.nickname;
        this.loggedIn = true;
      })
      .catch(err => {
        console.log(err);
        this.loggedIn = false;
      });
  }

  logout() {
    Auth.signOut()
      .then(() => this.loggedIn = false);
  }

  private loginWithCognito(username: string, password: string) {
    return Auth.signIn(username, password)
      .then(user => {
        const tokens = user.signInUserSession;
        if (tokens != null) {
          console.log(user);
          this.nickname = user.attributes.nickname;
          this.loggedIn = true;
        }
      })
      .catch(err => {
        console.log(err);
        err.next();
      })
  }
}
