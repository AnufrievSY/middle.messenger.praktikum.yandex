import mediator from '../mediator/AppMediator';
import ChatService, {
  ChatPreview,
  Message,
  MessageStatus,
} from '../services/chatService';
import AuthService from '../services/authService';
import ChatStorage from './chat/chatStorage';
import {
  applyDeliveredStatus,
  mergeUniqueMessages,
  replaceSendingMessage,
} from './chat/messageUtils';
import { APP_EVENTS } from '../events';

export default class ChatController {
  private activeChatId: number | null = null;

  private messagesByChat = new Map<number, Message[]>();

  private chats: ChatPreview[] = [];

  private readonly chatStorage = new ChatStorage();

  constructor(private service: ChatService, private authService: AuthService) {
    mediator.on(APP_EVENTS.chatsRequest, this.handleChatsRequest.bind(this));
    mediator.on(APP_EVENTS.chatsSelect, this.handleChatSelect.bind(this));
    mediator.on(APP_EVENTS.messageSend, this.handleMessageSend.bind(this));
    mediator.on(APP_EVENTS.chatsCreate, this.handleCreateChat.bind(this));
    mediator.on(APP_EVENTS.chatsAddUser, this.handleAddUser.bind(this));
    mediator.on(APP_EVENTS.chatsRemoveUser, this.handleRemoveUser.bind(this));
    mediator.on(APP_EVENTS.chatsRename, this.handleRenameChat.bind(this));
    mediator.on(APP_EVENTS.chatsAvatar, this.handleUpdateChatAvatar.bind(this));
    mediator.on(APP_EVENTS.chatsUsersRequest, this.handleUsersRequest.bind(this));
    mediator.on(APP_EVENTS.chatsDelete, this.handleDeleteChat.bind(this));
  }

  private async handleChatsRequest(): Promise<void> {
    try {
      const chats = await this.service.getChats();
      this.chats = this.chatStorage.applyChatMetaOverrides(chats);
      mediator.emit(APP_EVENTS.chatsUpdate, this.chats);

      if (chats.length > 0 && this.activeChatId === null) {
        await this.selectChat(chats[0].id);
      }
    } catch (error) {
      mediator.emit(APP_EVENTS.uiError, 'Не удалось загрузить список чатов');
      console.error('Failed to load chats', error);
    }
  }

  private async handleChatSelect(chatId: number): Promise<void> {
    if (chatId === this.activeChatId) {
      const existingMessages = this.messagesByChat.get(chatId)
        ?? this.chatStorage.getStoredMessages(chatId);
      mediator.emit(APP_EVENTS.messagesUpdate, existingMessages);
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
    mediator.emit(APP_EVENTS.chatsUpdate, this.chats);
  }

  private async handleUsersRequest(chatId: number): Promise<void> {
    const users = await this.service.getChatUsers(chatId);
    mediator.emit(APP_EVENTS.chatsUsersUpdate, users);
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
        mediator.emit(APP_EVENTS.chatsUserNotFound, 'Пользователь с таким логином не найден');
      }
    }

    await this.handleChatsRequest();
    await this.selectChat(chatId);
  }

  private async handleDeleteChat(chatId: number): Promise<void> {
    await this.service.deleteChat(chatId);

    this.messagesByChat.delete(chatId);
    this.chatStorage.clearStoredMessages(chatId);

    if (this.activeChatId === chatId) {
      this.activeChatId = null;
      mediator.emit(APP_EVENTS.messagesUpdate, []);
    }

    await this.handleChatsRequest();
  }

  private async handleRenameChat(payload: { chatId: number; title: string }): Promise<void> {
    const title = payload.title.trim();
    if (!title) {
      return;
    }

    this.applyChatMetaPatch(
      payload.chatId,
      this.chatStorage.upsertChatMetaOverride(payload.chatId, { title }),
    );

    try {
      await this.service.updateChatTitle(payload.chatId, title);
      await this.handleChatsRequest();
      return;
    } catch (error) {
      mediator.emit(APP_EVENTS.uiError, 'Не удалось переименовать чат');
      console.error('Failed to update chat title', error);
    }

    mediator.emit(APP_EVENTS.chatsUpdate, this.chats);
    mediator.emit(APP_EVENTS.chatActive, payload.chatId);
  }

  private async handleUpdateChatAvatar(payload: { chatId: number; file: File }): Promise<void> {
    try {
      const previewUrl = URL.createObjectURL(payload.file);
      this.applyChatMetaPatch(
        payload.chatId,
        this.chatStorage.upsertChatMetaOverride(payload.chatId, { avatar: previewUrl }),
      );

      await this.service.updateChatAvatar(payload.chatId, payload.file);
      await this.handleChatsRequest();
    } catch (error) {
      mediator.emit(APP_EVENTS.uiError, 'Не удалось обновить аватар чата');
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
      mediator.emit(APP_EVENTS.chatsUserNotFound, 'Пользователь с таким логином не найден');
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
    mediator.emit(APP_EVENTS.chatActive, chatId);
    this.handleMarkChatAsRead(chatId);

    const cachedMessages = this.messagesByChat.get(chatId)
      ?? this.chatStorage.getStoredMessages(chatId);
    this.messagesByChat.set(chatId, cachedMessages);
    mediator.emit(APP_EVENTS.messagesUpdate, cachedMessages);

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

    const merged = mergeUniqueMessages([...normalizedHistory, ...sendingMessages]);
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
      updatedMessages = replaceSendingMessage(current, incomingMessage);
    } else {
      updatedMessages = [...current, incomingMessage];
      updatedMessages = updatedMessages.map((message) => {
        if (message.user_id === currentUserId && message.status === 'sent') {
          return { ...message, status: 'read' as MessageStatus };
        }
        return message;
      });
    }

    this.setMessages(chatId, mergeUniqueMessages(updatedMessages));
  }

  private setMessageStatus(chatId: number, localId: string, status: MessageStatus): void {
    const messages = this.messagesByChat.get(chatId) ?? [];
    const updated = applyDeliveredStatus(messages, localId, status);
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

    mediator.emit(APP_EVENTS.messagesUpdate, this.messagesByChat.get(chatId) ?? []);
  }

  private setMessages(chatId: number, messages: Message[]): void {
    this.messagesByChat.set(chatId, messages);
    this.chatStorage.storeMessages(chatId, messages);
  }

  private applyChatMetaPatch(
    chatId: number,
    patch: { title?: string; avatar?: string | null },
  ): void {
    this.chats = this.chats.map((chat) => {
      if (chat.id !== chatId) {
        return chat;
      }

      return {
        ...chat,
        title: patch.title ?? chat.title,
        avatar: patch.avatar ?? chat.avatar,
      };
    });

    mediator.emit(APP_EVENTS.chatsUpdate, this.chats);
  }
}

export type { ChatPreview, Message };
