import { Injectable } from '@angular/core';
import {WEBSOCKET_ADDRESS} from "../../../../environments/secret-info";
import {MessageService} from "../messages/message.service";
import {WhoEnum} from "../../constants/chat-message";

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  websocket: WebSocket | undefined;

  constructor(private messageService: MessageService) {}

  setupWebsocket(user: any, username: string) {
    if (!this.websocket)
      this.websocket = new WebSocket(
        `${WEBSOCKET_ADDRESS}?token=${user.accessToken.jwtToken}&username=${username}`
      );
    this.websocket.onopen = () => {
      console.log("connected");
      if(this.websocket) {
        this.websocket.send(
          JSON.stringify({
            action: "getConnectedList"
          })
        );
      }
    };
    this.websocket.onerror = (error) => {
      console.log("WebSocket Error " + JSON.stringify(error));
    };
    this.websocket.onclose = (e) => {
      console.log(
        "Socket is closed. Reconnect will be attempted in 1 second.",
        e.reason
      );
      setTimeout( () => {
        this.setupWebsocket(user, username);
      }, 1000);
    };
    this.websocket.onmessage = (event) => {
      console.log(event);
      const data = JSON.parse(
        event.data
      );
      console.log("Incoming: " + JSON.stringify(data));
      if(data.message) {
        this.messageService.newMessageSubject.next({message: data.message, date: new Date(), who: WhoEnum.OTHER})
      }
      if(data.online) {
        this.messageService.setOnlineUsers(data.online);
      }
    };
  }

  sendMessage(message: string, from: string, to: string) {
    const newMessage = { message: message, author: from, to: to };
    if(this.websocket) {
      this.websocket.send(
        JSON.stringify({
          action: "sendMessage",
          data: JSON.stringify(newMessage),
        })
      );
    }
    this.messageService.newMessageSubject.next({message: message, date: new Date(), who: WhoEnum.YOU})
  }
}
