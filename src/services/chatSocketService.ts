import { WS_BASE_URL } from '../config/api';
import { Message, SocketEventPayload } from './chatTypes';

type SocketQueueItem = {
  content: string;
  onSent?: () => void;
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

export default class ChatSocketService {
  private socket: WebSocket | null = null;

  private sendQueue: SocketQueueItem[] = [];

  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private reconnectAttempts = 0;

  private shouldReconnect = false;

  private currentConnection: ConnectionParams | null = null;

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
    this.socket = new WebSocket(`${WS_BASE_URL}/${userId}/${chatId}/${token}`);

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
