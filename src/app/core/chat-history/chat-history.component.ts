import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from "@angular/router";
import {ChatMessage, WhoEnum} from "../../shared/constants/chat-message";
import {MessageService} from "../../shared/services/messages/message.service";
import {AuthService} from "../../shared/services/auth/auth.service";

@Component({
  selector: 'app-chat-history',
  templateUrl: './chat-history.component.html',
  styleUrls: ['./chat-history.component.scss']
})
export class ChatHistoryComponent implements OnInit {

  whoEnum = WhoEnum;
  showInfoText: boolean = true;
  chatHistory: ChatMessage[] = [];
  otherUserName: string = '';

  constructor(private route: ActivatedRoute,
              private messageService: MessageService,
              public auth: AuthService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      let id = params['userId'];
      if (!!id) {
        id = Number(id);
        this.showInfoText = false;
        this.otherUserName = this.messageService.getOtherUserName(id);
        this.chatHistory = this.messageService.getMessages(id).sort((a, b) => {
          return a.date > b.date ? 1 : -1;
        });
        console.log(this.chatHistory);
      }
    })
  }

}
