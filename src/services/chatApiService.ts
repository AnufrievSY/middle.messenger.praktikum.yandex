import HTTPTransport from './httpTransport';
import { API_BASE_URL } from '../config/api';
import { ChatPreview, ChatUser } from './chatTypes';

type ChatTokenResponse = {
  token: string;
};

export default class ChatApiService {
  private transport = new HTTPTransport(API_BASE_URL);

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

  async updateChatTitle(chatId: number, title: string): Promise<void> {
    await this.transport.put('/chats', { data: { chatId, title } });
  }

  async updateChatAvatar(chatId: number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('chatId', String(chatId));
    formData.append('avatar', file);
    await this.transport.put('/chats/avatar', { data: formData });
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
}
