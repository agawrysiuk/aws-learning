import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from "@angular/router";
import {ChatMessage} from "../../shared/constants/chat-message";
import {MessageService} from "../../shared/services/messages/message.service";
import {AuthService} from "../../shared/services/auth/auth.service";
import {Subscription} from "rxjs";
import {ConnectionService} from "../../shared/services/connection/connection.service";

@Component({
  selector: 'app-chat-history',
  templateUrl: './chat-history.component.html',
  styleUrls: ['./chat-history.component.scss']
})
export class ChatHistoryComponent implements OnInit, OnDestroy {

  me: string;
  showInfoText: boolean = true;
  chatHistory: ChatMessage[] = [];
  otherUserName: string = '';
  newMessageAcquiredSubscription: Subscription | undefined;

  constructor(private route: ActivatedRoute,
              private messageService: MessageService,
              public auth: AuthService,
              private connection: ConnectionService) {
    this.me = this.auth.visibleName;
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      let id = params['userId'];
      if (!!id) {
        this.showInfoText = false;
        this.otherUserName = id;
        this.messageService.recipientChanged.next(this.otherUserName);
        this.getChatHistory();
        this.newMessageAcquiredSubscription = this.messageService.newMessageSubject.subscribe((message: ChatMessage) => {
          if(this.otherUserName === message.from || this.auth.visibleName === message.from) {
            this.chatHistory.push(message);
          } else {
            // alert("New message outside this conversation from " + message.from + ": " + message.message);
          }
        })
      }
    })
  }

  ngOnDestroy(): void {
    if (this.newMessageAcquiredSubscription) {
      this.newMessageAcquiredSubscription.unsubscribe();
    }
  }

  private getChatHistory() {
    this.connection.getChatHistory(this.auth.visibleName, this.otherUserName)
      .then((history: any) => {
        console.log(history);
        this.chatHistory = history.messages.sort((a, b) => {
          return a.date > b.date ? 1 : -1;
        });
      });
  }
}
