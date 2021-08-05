import {Component, OnDestroy, OnInit} from '@angular/core';
import {ConnectionService} from "../../shared/services/connection/connection.service";
import {AuthService} from "../../shared/services/auth/auth.service";
import {Subscription} from "rxjs";
import {MessageService} from "../../shared/services/messages/message.service";

@Component({
  selector: 'app-writing',
  templateUrl: './writing.component.html',
  styleUrls: ['./writing.component.scss']
})
export class WritingComponent implements OnInit, OnDestroy {

  textToSend: any;
  recipientChangedSubscription: Subscription;
  recipient: string = '';

  constructor(private connection: ConnectionService,
              private messageService: MessageService,
              private auth: AuthService) {
    this.recipientChangedSubscription = this.messageService.recipientChanged.subscribe(value => this.recipient = value);
  }

  ngOnInit(): void {
  }

  send($event) {
    $event.preventDefault();
    console.log(this.textToSend);
    this.connection.sendMessage(this.textToSend, this.auth.visibleName, this.recipient);
    this.textToSend = '';
  }

  ngOnDestroy(): void {
    this.recipientChangedSubscription.unsubscribe();
  }
}
