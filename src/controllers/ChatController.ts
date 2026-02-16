import mediator from '../mediator/AppMediator';
import ChatService, {
  ChatPreview,
  Message,
  MessageStatus,
} from '../services/chatService';
import AuthService from '../services/authService';

const STORAGE_PREFIX = 'chat_messages_';
const CHATS_META_STORAGE = 'chat_meta_overrides';

type ChatMetaOverride = {
  title?: string;
  avatar?: string | null;
};

export default class ChatController {
  private activeChatId: number | null = null;

  private messagesByChat = new Map<number, Message[]>();

  private chats: ChatPreview[] = [];

  private chatMetaOverrides = new Map<number, ChatMetaOverride>();

  constructor(private service: ChatService, private authService: AuthService) {
    this.chatMetaOverrides = this.loadChatMetaOverrides();
    mediator.on('chats:request', this.handleChatsRequest.bind(this));
    mediator.on('chats:select', this.handleChatSelect.bind(this));
    mediator.on('message:send', this.handleMessageSend.bind(this));
    mediator.on('chats:create', this.handleCreateChat.bind(this));
    mediator.on('chats:add-user', this.handleAddUser.bind(this));
    mediator.on('chats:remove-user', this.handleRemoveUser.bind(this));
    mediator.on('chats:rename', this.handleRenameChat.bind(this));
    mediator.on('chats:avatar', this.handleUpdateChatAvatar.bind(this));
    mediator.on('chats:users:request', this.handleUsersRequest.bind(this));
    mediator.on('chats:delete', this.handleDeleteChat.bind(this));
  }

  private async handleChatsRequest(): Promise<void> {
    try {
      const chats = await this.service.getChats();
      this.chats = this.applyChatMetaOverrides(chats);
      mediator.emit('chats:update', this.chats);

      if (chats.length > 0 && this.activeChatId === null) {
        await this.selectChat(chats[0].id);
      }
    } catch (error) {
      console.error('Failed to load chats', error);
    }
  }

  private async handleChatSelect(chatId: number): Promise<void> {
    if (chatId === this.activeChatId) {
      const existingMessages = this.messagesByChat.get(chatId) ?? this.getStoredMessages(chatId);
      mediator.emit('messages:update', existingMessages);
      return;
    }

    await this.selectChat(chatId);
  }

  private handleMarkChatAsRead(chatId: number): void {
    this.chats = this.chats.map((chat) => {
      if (chat.id === chatId) {
        return {
          ...chat,
          unread_count: 0,
        };
      }
      return chat;
    });
    mediator.emit('chats:update', this.chats);
  }

  private async handleUsersRequest(chatId: number): Promise<void> {
    const users = await this.service.getChatUsers(chatId);
    mediator.emit('chats:users:update', users);
  }

  private async handleMessageSend(payload: { chatId: number; message: string }): Promise<void> {
    const message = payload.message.trim();
    if (!message) {
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return;
    }

    const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const optimisticMessage: Message = {
      id: Date.now(),
      localId,
      content: message,
      time: new Date().toISOString(),
      user_id: currentUser.id,
      status: 'sending',
    };

    this.pushMessage(payload.chatId, optimisticMessage);
    this.emitActiveMessages(payload.chatId);

    this.service.sendMessage(message, () => {
      this.setMessageStatus(payload.chatId, localId, 'sent');
      this.emitActiveMessages(payload.chatId);
    });
  }

  private async handleCreateChat(payload: { title: string; userLogin?: string }): Promise<void> {
    const title = payload.title.trim();
    if (!title) {
      return;
    }

    const chatId = await this.service.createChat(title);

    const userLogin = payload.userLogin?.trim();
    if (userLogin) {
      const userId = await this.authService.findUserIdByLogin(userLogin);
      if (userId) {
        await this.service.addUserToChat(userId, chatId);
      } else {
        mediator.emit('chats:user-not-found', 'Пользователь с таким логином не найден');
      }
    }

    await this.handleChatsRequest();
    await this.selectChat(chatId);
  }

  private async handleDeleteChat(chatId: number): Promise<void> {
    await this.service.deleteChat(chatId);

    this.messagesByChat.delete(chatId);
    this.clearStoredMessages(chatId);

    if (this.activeChatId === chatId) {
      this.activeChatId = null;
      mediator.emit('messages:update', []);
    }

    await this.handleChatsRequest();
  }

  private async handleRenameChat(payload: { chatId: number; title: string }): Promise<void> {
    const title = payload.title.trim();
    if (!title) {
      return;
    }

    this.upsertChatMetaOverride(payload.chatId, { title });

    try {
      await this.service.updateChatTitle(payload.chatId, title);
      await this.handleChatsRequest();
      return;
    } catch (error) {
      console.error('Failed to update chat title', error);
    }

    this.chats = this.chats.map((chat) => {
      if (chat.id === payload.chatId) {
        return { ...chat, title };
      }
      return chat;
    });

    mediator.emit('chats:update', this.chats);
    mediator.emit('chat:active', payload.chatId);
  }

  private async handleUpdateChatAvatar(payload: { chatId: number; file: File }): Promise<void> {
    try {
      const previewUrl = URL.createObjectURL(payload.file);
      this.upsertChatMetaOverride(payload.chatId, { avatar: previewUrl });

      await this.service.updateChatAvatar(payload.chatId, payload.file);
      await this.handleChatsRequest();
    } catch (error) {
      console.error('Failed to update chat avatar', error);
    }
  }

  private async handleAddUser(payload: { login: string; chatId: number }): Promise<void> {
    const login = payload.login.trim();
    if (!login) {
      return;
    }

    const userId = await this.authService.findUserIdByLogin(login);
    if (!userId) {
      mediator.emit('chats:user-not-found', 'Пользователь с таким логином не найден');
      return;
    }

    await this.service.addUserToChat(userId, payload.chatId);
    await this.handleUsersRequest(payload.chatId);
  }

  private async handleRemoveUser(payload: { userId: number; chatId: number }): Promise<void> {
    await this.service.removeUserFromChat(payload.userId, payload.chatId);
    await this.handleUsersRequest(payload.chatId);
  }

  private async selectChat(chatId: number): Promise<void> {
    this.activeChatId = chatId;
    mediator.emit('chat:active', chatId);
    this.handleMarkChatAsRead(chatId);

    const cachedMessages = this.messagesByChat.get(chatId) ?? this.getStoredMessages(chatId);
    this.messagesByChat.set(chatId, cachedMessages);
    mediator.emit('messages:update', cachedMessages);

    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    const token = await this.service.getToken(chatId);
    this.service.connect(chatId, user.id, token, ({ kind, messages }) => {
      if (kind === 'history') {
        this.applyHistory(chatId, messages, user.id);
      } else {
        this.applyRealtimeMessage(chatId, messages[0], user.id);
      }

      this.emitActiveMessages(chatId);
    });

    await this.handleUsersRequest(chatId);
  }

  private applyHistory(chatId: number, incomingMessages: Message[], currentUserId: number): void {
    const current = this.messagesByChat.get(chatId) ?? [];

    const sendingMessages = current.filter((message) => message.status === 'sending');
    const normalizedHistory = incomingMessages
      .map((message) => ({
        ...message,
        status: message.user_id === currentUserId ? 'sent' as MessageStatus : undefined,
      }))
      .sort((left, right) => new Date(left.time).getTime() - new Date(right.time).getTime());

    const merged = this.mergeUnique([...normalizedHistory, ...sendingMessages]);
    this.setMessages(chatId, merged);
  }

  private applyRealtimeMessage(
    chatId: number,
    incomingMessage: Message | undefined,
    currentUserId: number,
  ): void {
    if (!incomingMessage) {
      return;
    }

    const current = this.messagesByChat.get(chatId) ?? [];
    const exists = current.some((message) => message.id === incomingMessage.id);
    if (exists) {
      return;
    }

    let updatedMessages = current;

    if (incomingMessage.user_id === currentUserId) {
      updatedMessages = this.replaceSendingMessage(current, incomingMessage);
    } else {
      updatedMessages = [...current, incomingMessage];
      updatedMessages = updatedMessages.map((message) => {
        if (message.user_id === currentUserId && message.status === 'sent') {
          return { ...message, status: 'read' as MessageStatus };
        }
        return message;
      });
    }

    this.setMessages(chatId, this.mergeUnique(updatedMessages));
  }

  private replaceSendingMessage(messages: Message[], incomingMessage: Message): Message[] {
    const sendingIndex = messages.findIndex((message) => {
      const isOwnPendingMessage = message.status === 'sending' || message.status === 'sent';
      return isOwnPendingMessage && message.content === incomingMessage.content && message.localId;
    });

    if (sendingIndex === -1) {
      return [...messages, { ...incomingMessage, status: 'sent' }];
    }

    const updated = [...messages];
    const sendingMessage = updated[sendingIndex];

    updated[sendingIndex] = {
      ...incomingMessage,
      localId: sendingMessage.localId,
      status: 'sent',
    };

    return updated;
  }

  private setMessageStatus(chatId: number, localId: string, status: MessageStatus): void {
    const messages = this.messagesByChat.get(chatId) ?? [];
    const updated = messages.map((message) => {
      if (message.localId === localId) {
        return {
          ...message,
          status,
        };
      }

      return message;
    });

    this.setMessages(chatId, updated);
  }

  private pushMessage(chatId: number, message: Message): void {
    const current = this.messagesByChat.get(chatId) ?? [];
    this.setMessages(chatId, [...current, message]);
  }

  private emitActiveMessages(chatId: number): void {
    if (this.activeChatId !== chatId) {
      return;
    }

    mediator.emit('messages:update', this.messagesByChat.get(chatId) ?? []);
  }

  private mergeUnique(messages: Message[]): Message[] {
    const map = new Map<string, Message>();

    messages.forEach((message) => {
      const key = message.localId ?? String(message.id);
      map.set(key, message);
    });

    return [...map.values()].sort(
      (left, right) => new Date(left.time).getTime() - new Date(right.time).getTime(),
    );
  }

  private setMessages(chatId: number, messages: Message[]): void {
    this.messagesByChat.set(chatId, messages);
    this.storeMessages(chatId, messages);
  }

  private getStoredMessages(chatId: number): Message[] {
    try {
      const serialized = sessionStorage.getItem(`${STORAGE_PREFIX}${chatId}`);
      if (!serialized) {
        return [];
      }
      const parsed = JSON.parse(serialized) as Message[];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  private storeMessages(chatId: number, messages: Message[]): void {
    try {
      sessionStorage.setItem(`${STORAGE_PREFIX}${chatId}`, JSON.stringify(messages));
    } catch (error) {
      // no-op
    }
  }

  private clearStoredMessages(chatId: number): void {
    try {
      sessionStorage.removeItem(`${STORAGE_PREFIX}${chatId}`);
    } catch (error) {
      // no-op
    }
  }

  private applyChatMetaOverrides(chats: ChatPreview[]): ChatPreview[] {
    return chats.map((chat) => {
      const override = this.chatMetaOverrides.get(chat.id);
      if (!override) {
        return chat;
      }

      return {
        ...chat,
        title: override.title ?? chat.title,
        avatar: override.avatar ?? chat.avatar,
      };
    });
  }

  private upsertChatMetaOverride(chatId: number, patch: ChatMetaOverride): void {
    const current = this.chatMetaOverrides.get(chatId) ?? {};
    const next = {
      ...current,
      ...patch,
    };
    this.chatMetaOverrides.set(chatId, next);
    this.storeChatMetaOverrides();

    this.chats = this.chats.map((chat) => {
      if (chat.id !== chatId) {
        return chat;
      }

      return {
        ...chat,
        title: next.title ?? chat.title,
        avatar: next.avatar ?? chat.avatar,
      };
    });
    mediator.emit('chats:update', this.chats);
  }

  private loadChatMetaOverrides(): Map<number, ChatMetaOverride> {
    try {
      const serialized = localStorage.getItem(CHATS_META_STORAGE);
      if (!serialized) {
        return new Map();
      }

      const parsed = JSON.parse(serialized) as Record<string, ChatMetaOverride>;
      const entries = Object.entries(parsed).map(([key, value]) => [Number(key), value] as const);
      return new Map(entries);
    } catch (error) {
      return new Map();
    }
  }

  private storeChatMetaOverrides(): void {
    try {
      const object = [...this.chatMetaOverrides.entries()].reduce<Record<string, ChatMetaOverride>>(
        (acc, [chatId, value]) => {
          acc[String(chatId)] = value;
          return acc;
        },
        {},
      );
      localStorage.setItem(CHATS_META_STORAGE, JSON.stringify(object));
    } catch (error) {
      // no-op
    }
  }
}

export type { ChatPreview, Message };
