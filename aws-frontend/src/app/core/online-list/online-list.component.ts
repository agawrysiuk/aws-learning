import {Component, OnInit} from '@angular/core';
import {User} from "../../shared/constants/user";
import {Router} from "@angular/router";
import {MessageService} from "../../shared/services/messages/message.service";
import {AuthService} from "../../shared/services/auth/auth.service";

@Component({
  selector: 'app-online-list',
  templateUrl: './online-list.component.html',
  styleUrls: ['./online-list.component.scss']
})
export class OnlineListComponent implements OnInit {

  onlineList: User[] = [];

  constructor(private router: Router,
              private messageService: MessageService,
              private auth: AuthService) {
  }

  ngOnInit(): void {
    this.onlineList = this.messageService.getOnlineList(this.auth.visibleName);
  }

  openChat(username: string) {
    this.router.navigate(['/' + username]);
  }
}
