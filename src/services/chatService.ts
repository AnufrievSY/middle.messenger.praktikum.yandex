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

type ChatTokenResponse = {
  token: string;
};

export default class ChatService {
  private transport = new HTTPTransport('https://ya-praktikum.tech/api/v2');

  private socket: WebSocket | null = null;

  async getChats(): Promise<ChatPreview[]> {
    const response = await this.transport.get('/chats');
    return Array.isArray(response) ? (response as ChatPreview[]) : [];
  }

  async createChat(title: string): Promise<void> {
    await this.transport.post('/chats', { data: { title } });
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
    chatId: number,
    userId: number,
    token: string,
    onMessages: (messages: Message[]) => void,
  ): void {
    this.disconnect();

    this.socket = new WebSocket(`wss://ya-praktikum.tech/ws/chats/${userId}/${token}`);

    this.socket.addEventListener('open', () => {
      this.socket?.send(JSON.stringify({ content: '0', type: 'get old' }));
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

    console.log('WebSocket connected', { chatId });
  }

  sendMessage(message: string): void {
    this.socket?.send(JSON.stringify({ content: message, type: 'message' }));
  }

  disconnect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
    this.socket = null;
  }
}
