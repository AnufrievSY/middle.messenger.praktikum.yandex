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
    mediator.on('chats:users:request', this.handleUsersRequest.bind(this));
    mediator.on('chats:delete', this.handleDeleteChat.bind(this));
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
    if (currentUser) {
      const optimisticMessage: Message = {
        id: Date.now(),
        content: message,
        time: new Date().toISOString(),
        user_id: currentUser.id,
      };

      this.messages = [...this.messages, optimisticMessage];
      mediator.emit('messages:update', this.messages);
    }

    this.service.sendMessage(message);
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
      }
    }

    await this.handleChatsRequest();
    await this.selectChat(chatId);
  }

  private async handleDeleteChat(chatId: number): Promise<void> {
    await this.service.deleteChat(chatId);
    this.activeChatId = null;
    this.messages = [];
    mediator.emit('messages:update', []);
    await this.handleChatsRequest();
  }

  private async handleAddUser(payload: { login: string; chatId: number }): Promise<void> {
    const login = payload.login.trim();
    if (!login) {
      return;
    }

    const userId = await this.authService.findUserIdByLogin(login);
    if (!userId) {
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

    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    this.messages = [];
    mediator.emit('messages:update', this.messages);

    const token = await this.service.getToken(chatId);
    this.service.connect(user.id, token, (incomingMessages) => {
      const newMessages = [...incomingMessages].reverse();
      this.messages = [...newMessages];
      mediator.emit('messages:update', this.messages);
    });

    await this.handleUsersRequest(chatId);
  }
}

export type { ChatPreview, Message };
