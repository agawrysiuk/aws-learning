import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loggedIn: boolean = false;

  get isLoggedIn(): boolean {
    return this.loggedIn;
  }

  get userName(): string {
    return 'Arek';
  }

  get userId(): number {
    return this.id;
  }

  constructor() {}

  login() {
    this.loggedIn = true;
  }
}
