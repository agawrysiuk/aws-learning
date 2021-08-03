import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../shared/services/auth/auth.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  userName: string;

  constructor(private auth: AuthService) {
    this.userName = this.auth.userName;
  }

  ngOnInit(): void {
  }

}
