import {Injectable} from '@angular/core';
import {ChatMessage, WhoEnum} from "../../constants/chat-message";
import * as moment from "moment";
import {User} from "../../constants/user";

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  onlineUsers: User[] = [
    {userName: 'Konrad', id: 1},
    {userName: 'Andrzej', id: 2}
  ];

  constructor() { }

  getOnlineList() {
    return this.onlineUsers;
  }

  getOtherUserName(id: number) {
    const otherUser = this.onlineUsers.find(u => u.id == id);
    return otherUser ? otherUser.userName : 'Unknown';
  }

  getMessages(id: number): ChatMessage[] {
    return this.getMockMessages(id);
  }

  private getMockMessages(id: number): ChatMessage[] {
    if(id == 1) {
      return [
        {
          who: WhoEnum.YOU,
          date: moment().subtract(2, 'minute').toDate(),
          message: 'Hi, what\'s up?'
        },
        {
          who: WhoEnum.OTHER,
          date: moment().subtract(1, 'minute').toDate(),
          message: 'Not much, how about you?'
        }
      ];
    } else {
      return [];
    }
  }
}
