import ChatApiService from './chatApiService';
import ChatSocketService from './chatSocketService';
import { ChatPreview, ChatUser, SocketEventPayload } from './chatTypes';

export type {
  ChatPreview, Message, MessageStatus, ChatUser,
} from './chatTypes';

export default class ChatService {
  private apiService = new ChatApiService();

  private socketService = new ChatSocketService();

  async getChats(): Promise<ChatPreview[]> {
    return this.apiService.getChats();
  }

  async createChat(title: string): Promise<number> {
    return this.apiService.createChat(title);
  }

  async deleteChat(chatId: number): Promise<void> {
    await this.apiService.deleteChat(chatId);
  }

  async updateChatTitle(chatId: number, title: string): Promise<void> {
    await this.apiService.updateChatTitle(chatId, title);
  }

  async updateChatAvatar(chatId: number, file: File): Promise<void> {
    await this.apiService.updateChatAvatar(chatId, file);
  }

  async getChatUsers(chatId: number): Promise<ChatUser[]> {
    return this.apiService.getChatUsers(chatId);
  }

  async addUserToChat(userId: number, chatId: number): Promise<void> {
    await this.apiService.addUserToChat(userId, chatId);
  }

  async removeUserFromChat(userId: number, chatId: number): Promise<void> {
    await this.apiService.removeUserFromChat(userId, chatId);
  }

  async getToken(chatId: number): Promise<string> {
    return this.apiService.getToken(chatId);
  }

  connect(
    chatId: number,
    userId: number,
    token: string,
    onMessages: (payload: SocketEventPayload) => void,
  ): void {
    this.socketService.connect(chatId, userId, token, onMessages);
  }

  sendMessage(message: string, onSent?: () => void): void {
    this.socketService.sendMessage(message, onSent);
  }

  disconnect(): void {
    this.socketService.disconnect();
  }
}
