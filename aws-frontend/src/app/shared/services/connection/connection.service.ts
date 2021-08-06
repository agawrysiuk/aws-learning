import {Injectable} from '@angular/core';
import {WEBSOCKET_ADDRESS} from "../../../../environments/secret-info";
import {MessageService} from "../messages/message.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ChatMessage} from "../../constants/chat-message";

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  websocket: WebSocket | undefined;
  jwtToken: any;

  constructor(private messageService: MessageService,
              private http: HttpClient) {
  }

  setupWebsocket(user: any, username: string) {
    if (!this.websocket)
      this.websocket = new WebSocket(
        `${WEBSOCKET_ADDRESS}?token=${user.accessToken.jwtToken}&username=${username}`
      );
    this.websocket.onopen = () => {
      console.log("connected");
      if (this.websocket) {
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
      setTimeout(() => {
        this.setupWebsocket(user, username);
      }, 1000);
    };
    this.websocket.onmessage = (event) => {
      console.log(event);
      const data = JSON.parse(
        event.data
      );
      console.log("Incoming: " + JSON.stringify(data));
      if (data.message) {
        this.messageService.newMessageSubject.next({
          message: data.message,
          date: data.date,
          from: data.from,
          to: data.to
        })
      }
      if (data.online) {
        this.messageService.setOnlineUsers(data.online);
      }
    };
  }

  sendMessage(message: string, from: string, to: string) {
    const newMessage = {message: message, date: new Date(), from: from, to: to};
    if (this.websocket) {
      this.websocket.send(
        JSON.stringify({
          action: "sendMessage",
          data: JSON.stringify(newMessage),
        })
      );
    }
    this.messageService.newMessageSubject.next(newMessage)
  }

  getChatHistory(from: string, to: string) {
    const headers = new HttpHeaders({
      'Authorization': this.jwtToken
    });
    return this.http.get(
      'https://imm0zuyu37.execute-api.eu-west-1.amazonaws.com/history?from=' + from + '&to=' + to,
      {headers: headers}
    ).toPromise();
  }
}
