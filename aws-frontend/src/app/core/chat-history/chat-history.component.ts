import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from "@angular/router";
import {ChatMessage, WhoEnum} from "../../shared/constants/chat-message";
import {MessageService} from "../../shared/services/messages/message.service";
import {AuthService} from "../../shared/services/auth/auth.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-chat-history',
  templateUrl: './chat-history.component.html',
  styleUrls: ['./chat-history.component.scss']
})
export class ChatHistoryComponent implements OnInit, OnDestroy {

  whoEnum = WhoEnum;
  showInfoText: boolean = true;
  chatHistory: ChatMessage[] = [];
  otherUserName: string = '';
  newMessageAcquiredSubscription: Subscription | undefined;

  constructor(private route: ActivatedRoute,
              private messageService: MessageService,
              public auth: AuthService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      let id = params['userId'];
      if (!!id) {
        this.showInfoText = false;
        this.otherUserName = this.messageService.getOtherUserName(id);
        this.messageService.recipientChanged.next(this.otherUserName);
        this.newMessageAcquiredSubscription = this.messageService.newMessageSubject.subscribe((message: ChatMessage) => {
          this.chatHistory.push(message);
        })
      }
    })
  }

  ngOnDestroy(): void {
    if (this.newMessageAcquiredSubscription) {
      this.newMessageAcquiredSubscription.unsubscribe();
    }
  }

}
