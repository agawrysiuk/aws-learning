import {Injectable} from '@angular/core';
import {Auth} from 'aws-amplify';
import {ConnectionService} from "../connection/connection.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loggedIn: boolean = true;
  private nickname: string = '';

  get isLoggedIn(): boolean {
    return this.loggedIn;
  }

  get visibleName(): string {
    return this.nickname;
  }

  constructor(private connection: ConnectionService) {
  }

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
        this.connection.jwtToken = user.getAccessToken().getJwtToken();
        this.connection.setupWebsocket(user, this.nickname);
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
          this.connection.jwtToken = user.signInUserSession.accessToken.jwtToken;
          this.connection.setupWebsocket(user.signInUserSession, this.nickname);
          this.loggedIn = true;
        }
      })
      .catch(err => {
        console.log(err);
        err.next();
      })
  }

  register(email: string, nickname: string, password: string) {
    return Auth.signUp({
        username: email,
        password: password,
        attributes: {
          nickname: nickname,
        }
      }
    );
  }
}
