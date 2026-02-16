export type ChatPreview = {
  id: number;
  title: string;
  unread_count: number;
  avatar: string | null;
  last_message?: { content: string; user: { first_name: string } };
};

export type MessageStatus = 'sending' | 'sent' | 'read';

export type Message = {
  id: number;
  content: string;
  time: string;
  user_id: number;
  status?: MessageStatus;
  localId?: string;
};

export type ChatUser = {
  id: number;
  first_name: string;
  second_name: string;
  login: string;
  avatar: string | null;
};

export type SocketEventPayload = {
  kind: 'history' | 'message';
  messages: Message[];
};
