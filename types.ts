
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  lastSeen: string;
  createdAt: string;
}

export interface Message {
  id: string;
  text: string;
  timestamp: string;
  sender: 'user' | 'agent';
}

export interface Conversation {
  userId: string;
  messages: Message[];
}

export enum View {
  Users = 'users',
  Inbox = 'inbox',
}
