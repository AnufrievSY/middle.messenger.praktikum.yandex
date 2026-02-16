import type { AuthData, RegisterData, User } from './services/authService';
import type { PasswordData, SettingsData } from './services/settingsService';
import type { ChatPreview, Message } from './services/chatService';

export type AppEvents = {
  'auth:login': [AuthData];
  'auth:register': [RegisterData];
  'auth:logout': [];
  'auth:user': [User | null];

  'settings:update': [SettingsData];
  'settings:password': [PasswordData];
  'settings:avatar': [File];

  'route:go': [string];
  'route:back': [];
  'route:forward': [];

  'chats:select': [number];
  'chats:request': [];
  'chats:create': [string];
  'chats:add-user': [{ userId: number; chatId: number }];
  'chats:remove-user': [{ userId: number; chatId: number }];
  'message:send': [{ chatId: number; message: string }];

  'chats:update': [ChatPreview[]];
  'messages:update': [Message[]];
  'chat:active': [number];
};
