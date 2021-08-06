import {Injectable} from '@angular/core';
import {ChatMessage} from "../../constants/chat-message";
import {User} from "../../constants/user";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private chatHistory: ChatMessage[] = [];

  recipientChanged = new Subject<string>();
  newMessageSubject = new Subject<ChatMessage>();
  onlineUsersRefreshed = new Subject<User[]>();
  onlineUsers: User[] = [];
  constructor() { }

  getOtherUserName(username: string) {
    const otherUser = this.onlineUsers.find(u => u.userName == username);
    return otherUser ? otherUser.userName : 'Unknown';
  }

  sort() {
    // todo: check if needed
    this.chatHistory = this.chatHistory.sort((a, b) => {
      return a.date > b.date ? 1 : -1;
    });
  }

  setOnlineUsers(online: string[]) {
    this.onlineUsers = online.map(s => {
      return {userName: s};
    });
    this.onlineUsersRefreshed.next(this.onlineUsers);
  }
}
