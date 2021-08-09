import {Component, OnDestroy, OnInit} from '@angular/core';
import {MessageService} from "../../shared/services/messages/message.service";
import {Subscription} from "rxjs";
import {ConnectionService} from "../../shared/services/connection/connection.service";
import {AuthService} from "../../shared/services/auth/auth.service";

@Component({
  selector: 'app-writing',
  templateUrl: './writing.component.html',
  styleUrls: ['./writing.component.scss']
})
export class WritingComponent implements OnInit, OnDestroy {

  textToSend: any;
  recipient: string = '';
  recipientSub: Subscription | undefined;

  constructor(private connection: ConnectionService,
              private messageService: MessageService,
              private auth: AuthService) {
    this.recipientSub = this.messageService.recipientChanged.subscribe(value => this.recipient = value);
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if(this.recipientSub) {
      this.recipientSub.unsubscribe();
    }
  }

  send($event) {
    $event.preventDefault();
    console.log("Sending: " + this.textToSend);
    this.connection.sendMessage(this.textToSend, this.auth.visibleName, this.recipient);
    this.textToSend = '';
  }
}
