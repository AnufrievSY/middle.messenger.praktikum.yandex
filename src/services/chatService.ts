import HTTPTransport from './httpTransport';

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

type ChatTokenResponse = {
  token: string;
};

type SocketQueueItem = {
  content: string;
  onSent?: () => void;
};

type SocketEventPayload = {
  kind: 'history' | 'message';
  messages: Message[];
};

type SocketMessage = {
  id?: number;
  user_id?: number;
  time?: string;
  content?: string;
  type?: string;
};

type ConnectionParams = {
  chatId: number;
  userId: number;
  token: string;
  onMessages: (payload: SocketEventPayload) => void;
};

export default class ChatService {
  private transport = new HTTPTransport('https://ya-praktikum.tech/api/v2');

  private socket: WebSocket | null = null;

  private sendQueue: SocketQueueItem[] = [];

  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private reconnectAttempts = 0;

  private shouldReconnect = false;

  private currentConnection: ConnectionParams | null = null;

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
    chatId: number,
    userId: number,
    token: string,
    onMessages: (payload: SocketEventPayload) => void,
  ): void {
    this.disconnect();
    this.sendQueue = [];

    this.currentConnection = {
      chatId,
      userId,
      token,
      onMessages,
    };
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;

    this.openSocket();
  }

  sendMessage(message: string, onSent?: () => void): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ content: message, type: 'message' }));
      onSent?.();
      return;
    }

    this.sendQueue.push({ content: message, onSent });
  }

  disconnect(): void {
    this.shouldReconnect = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close();
    }

    this.socket = null;
    this.currentConnection = null;
    this.reconnectAttempts = 0;
  }

  private openSocket(): void {
    if (!this.currentConnection) {
      return;
    }

    const {
      chatId,
      userId,
      token,
      onMessages,
    } = this.currentConnection;
    this.socket = new WebSocket(`wss://ya-praktikum.tech/ws/chats/${userId}/${chatId}/${token}`);

    this.socket.addEventListener('open', () => {
      this.reconnectAttempts = 0;
      this.socket?.send(JSON.stringify({ content: '0', type: 'get old' }));
      this.flushQueue();
    });

    this.socket.addEventListener('message', (event) => {
      const parsed = JSON.parse(event.data) as SocketMessage[] | SocketMessage;

      if (Array.isArray(parsed)) {
        const history = parsed
          .map((item) => this.toMessage(item))
          .filter((item): item is Message => item !== null);
        onMessages({ kind: 'history', messages: history });
        return;
      }

      if (parsed.type !== 'message') {
        return;
      }

      const message = this.toMessage(parsed);
      if (!message) {
        return;
      }

      onMessages({ kind: 'message', messages: [message] });
    });

    this.socket.addEventListener('close', () => {
      this.socket = null;
      if (this.shouldReconnect) {
        this.scheduleReconnect();
      }
    });
  }

  private scheduleReconnect(): void {
    if (!this.currentConnection) {
      return;
    }

    const timeout = Math.min(1000 * 2 ** this.reconnectAttempts, 10_000);
    this.reconnectAttempts += 1;

    this.reconnectTimer = setTimeout(() => {
      this.openSocket();
    }, timeout);
  }

  private flushQueue(): void {
    while (this.sendQueue.length && this.socket?.readyState === WebSocket.OPEN) {
      const queueItem = this.sendQueue.shift();
      if (!queueItem) {
        break;
      }

      this.socket.send(JSON.stringify({ content: queueItem.content, type: 'message' }));
      queueItem.onSent?.();
    }
  }

  private toMessage(value: SocketMessage): Message | null {
    const {
      id,
      content,
      time,
      user_id: userId,
    } = value;

    if (
      typeof id !== 'number'
      || typeof content !== 'string'
      || typeof time !== 'string'
      || typeof userId !== 'number'
    ) {
      return null;
    }

    return {
      id,
      content,
      time,
      user_id: userId,
    };
  }
}
