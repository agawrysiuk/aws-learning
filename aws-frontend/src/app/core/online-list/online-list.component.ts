import {Component, OnDestroy, OnInit} from '@angular/core';
import {User} from "../../shared/constants/user";
import {Router} from "@angular/router";
import {MessageService} from "../../shared/services/messages/message.service";
import {AuthService} from "../../shared/services/auth/auth.service";
import {Subscription} from "rxjs";
import {audit} from "rxjs/operators";

@Component({
  selector: 'app-online-list',
  templateUrl: './online-list.component.html',
  styleUrls: ['./online-list.component.scss']
})
export class OnlineListComponent implements OnInit, OnDestroy {

  onlineListSub: Subscription | undefined;
  onlineList: User[] = [];

  constructor(private router: Router,
              private messageService: MessageService,
              private auth: AuthService) {
  }

  ngOnInit(): void {
    this.onlineListSub = this.messageService.onlineUsersRefreshed.subscribe(list => {
      return this.onlineList = list.filter(u => u.userName !== this.auth.visibleName);
    });
  }

  openChat(username: string) {
    this.router.navigate(['/' + username]);
  }

  ngOnDestroy(): void {
    if(this.onlineListSub) {
      this.onlineListSub.unsubscribe();
    }
  }
}
