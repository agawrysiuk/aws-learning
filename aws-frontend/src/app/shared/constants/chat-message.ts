export interface ChatMessage {
  who: WhoEnum
  date: Date;
  message: string;
}

export enum WhoEnum {
  YOU,
  OTHER
}
