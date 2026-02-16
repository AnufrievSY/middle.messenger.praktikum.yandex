import mediator from '../mediator/AppMediator';
import ChatService, { ChatPreview, Message } from '../services/chatService';
import AuthService from '../services/authService';

export default class ChatController {
  private activeChatId: number | null = null;

  private messages: Message[] = [];

  constructor(private service: ChatService, private authService: AuthService) {
    mediator.on('chats:request', this.handleChatsRequest.bind(this));
    mediator.on('chats:select', this.handleChatSelect.bind(this));
    mediator.on('message:send', this.handleMessageSend.bind(this));
    mediator.on('chats:create', this.handleCreateChat.bind(this));
    mediator.on('chats:add-user', this.handleAddUser.bind(this));
    mediator.on('chats:remove-user', this.handleRemoveUser.bind(this));
  }

  private async handleChatsRequest(): Promise<void> {
    try {
      const chats = await this.service.getChats();
      mediator.emit('chats:update', chats);
      if (chats.length > 0 && this.activeChatId === null) {
        await this.selectChat(chats[0].id);
      }
    } catch (error) {
      console.error('Failed to load chats', error);
    }
  }

  private async handleChatSelect(chatId: number): Promise<void> {
    await this.selectChat(chatId);
  }

  private async handleMessageSend(payload: { chatId: number; message: string }): Promise<void> {
    const message = payload.message.trim();
    if (!message) {
      return;
    }
    this.service.sendMessage(message);
  }

  private async handleCreateChat(title: string): Promise<void> {
    if (!title.trim()) {
      return;
    }
    await this.service.createChat(title.trim());
    await this.handleChatsRequest();
  }

  private async handleAddUser(payload: { userId: number; chatId: number }): Promise<void> {
    await this.service.addUserToChat(payload.userId, payload.chatId);
  }

  private async handleRemoveUser(payload: { userId: number; chatId: number }): Promise<void> {
    await this.service.removeUserFromChat(payload.userId, payload.chatId);
  }

  private async selectChat(chatId: number): Promise<void> {
    this.activeChatId = chatId;
    mediator.emit('chat:active', chatId);

    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    const token = await this.service.getToken(chatId);
    this.service.connect(chatId, user.id, token, (incomingMessages) => {
      const newMessages = [...incomingMessages].reverse();
      this.messages = [...this.messages, ...newMessages];
      mediator.emit('messages:update', this.messages);
    });

    this.messages = [];
    mediator.emit('messages:update', this.messages);
  }
}

export type { ChatPreview, Message };
