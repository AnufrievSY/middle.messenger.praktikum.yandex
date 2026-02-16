import HTTPTransport from './httpTransport';

export type ChatPreview = {
  id: number;
  title_name: string;
  title_date: string;
  not_read_count: number;
  last_message?: { author: string; text: string };
  avatar: string;
};

export type Message = {
  id: number;
  text: string;
  time: string;
  isMine?: boolean;
  chatId?: number;
};

export default class ChatService {
  private transport = new HTTPTransport();

  private messagesCache = new Map<number, Message[]>();

  private readonly userId = 0;

  async getChats(): Promise<ChatPreview[]> {
    const response = await this.transport.get(`/data/users/${this.userId}/chats.json`);
    return Array.isArray(response) ? (response as ChatPreview[]) : [];
  }

  async getMessages(chatId: number): Promise<Message[]> {
    if (this.messagesCache.has(chatId)) {
      return this.messagesCache.get(chatId) ?? [];
    }
    const response = await this.transport.get(`/data/users/${this.userId}/messages/${chatId}.json`);
    const list = Array.isArray(response) ? (response as Message[]) : [];
    this.messagesCache.set(chatId, list);
    return list;
  }

  async sendMessage(chatId: number, text: string): Promise<Message> {
    const messages = await this.getMessages(chatId);
    const message: Message = {
      id: Date.now(),
      chatId,
      text,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
    };
    messages.push(message);
    this.messagesCache.set(chatId, messages);
    return message;
  }
}
