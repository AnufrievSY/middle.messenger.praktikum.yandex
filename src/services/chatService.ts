import HTTPTransport from './httpTransport';

export type ChatPreview = {
  id: number;
  title: string;
  unread_count: number;
  avatar: string | null;
  last_message?: { content: string; user: { first_name: string } };
};

export type Message = {
  id: number;
  content: string;
  time: string;
  user_id: number;
};

export type ChatUser = {
  id: number;
  first_name: string;
  second_name: string;
  login: string;
  avatar: string | null;
};

type ChatTokenResponse = {
  token: string;
};

export default class ChatService {
  private transport = new HTTPTransport('https://ya-praktikum.tech/api/v2');

  private socket: WebSocket | null = null;

  private sendQueue: string[] = [];

  async getChats(): Promise<ChatPreview[]> {
    const response = await this.transport.get('/chats');
    return Array.isArray(response) ? (response as ChatPreview[]) : [];
  }

  async createChat(title: string): Promise<number> {
    const response = await this.transport.post('/chats', { data: { title } }) as { id: number };
    return response.id;
  }

  async deleteChat(chatId: number): Promise<void> {
    await this.transport.delete('/chats', { data: { chatId } });
  }

  async getChatUsers(chatId: number): Promise<ChatUser[]> {
    const users = await this.transport.get(`/chats/${chatId}/users`);
    return Array.isArray(users) ? (users as ChatUser[]) : [];
  }

  async addUserToChat(userId: number, chatId: number): Promise<void> {
    await this.transport.put('/chats/users', { data: { users: [userId], chatId } });
  }

  async removeUserFromChat(userId: number, chatId: number): Promise<void> {
    await this.transport.delete('/chats/users', { data: { users: [userId], chatId } });
  }

  async getToken(chatId: number): Promise<string> {
    const response = await this.transport.post(`/chats/token/${chatId}`) as ChatTokenResponse;
    return response.token;
  }

  connect(
    userId: number,
    token: string,
    onMessages: (messages: Message[]) => void,
  ): void {
    this.disconnect();

    this.socket = new WebSocket(`wss://ya-praktikum.tech/ws/chats/${userId}/${token}`);

    this.socket.addEventListener('open', () => {
      this.socket?.send(JSON.stringify({ content: '0', type: 'get old' }));
      this.flushQueue();
    });

    this.socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data) as Message[] | Message;
      if (Array.isArray(data)) {
        onMessages(data);
        return;
      }
      if ('content' in data) {
        onMessages([data]);
      }
    });

    this.socket.addEventListener('close', () => {
      this.socket = null;
    });
  }

  sendMessage(message: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ content: message, type: 'message' }));
      return;
    }
    this.sendQueue.push(message);
  }

  disconnect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
    this.socket = null;
    this.sendQueue = [];
  }

  private flushQueue(): void {
    while (this.sendQueue.length && this.socket?.readyState === WebSocket.OPEN) {
      const message = this.sendQueue.shift();
      if (!message) {
        break;
      }
      this.socket.send(JSON.stringify({ content: message, type: 'message' }));
    }
  }
}
