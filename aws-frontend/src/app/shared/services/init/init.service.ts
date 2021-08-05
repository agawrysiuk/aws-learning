import { Injectable } from '@angular/core';
import {AuthService} from "../auth/auth.service";

@Injectable({
  providedIn: 'root'
})
export class InitService {

  constructor(private auth: AuthService) { }

  init() {
    return this.auth.checkLoggedIn();
  }
}
