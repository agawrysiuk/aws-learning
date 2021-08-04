import {Component, OnInit} from '@angular/core';
import {User} from "../../shared/constants/user";
import {Router} from "@angular/router";
import {MessageService} from "../../shared/services/messages/message.service";

@Component({
  selector: 'app-online-list',
  templateUrl: './online-list.component.html',
  styleUrls: ['./online-list.component.scss']
})
export class OnlineListComponent implements OnInit {

  onlineList: User[] = [];

  constructor(private router: Router,
              private messageService: MessageService) {
  }

  ngOnInit(): void {
    this.onlineList = this.messageService.getOnlineList();
  }

  openChat(id: number) {
    this.router.navigate(['/' + id]);
  }
}
