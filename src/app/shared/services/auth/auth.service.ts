import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loggedIn: boolean = false;

  get isLoggedIn(): boolean {
    return this.loggedIn;
  }

  constructor() {}

  login() {
    this.loggedIn = true;
  }
}
