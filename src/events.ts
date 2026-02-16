import type { AuthData, RegisterData, User } from './services/authService';
import type { PasswordData, SettingsData } from './services/settingsService';
import type { ChatPreview, Message, ChatUser } from './services/chatService';

export type AppEvents = {
  'auth:login': [AuthData];
  'auth:register': [RegisterData];
  'auth:logout': [];
  'auth:user': [User | null];
  'auth:login-failed': [string];

  'settings:update': [SettingsData];
  'settings:password': [PasswordData];
  'settings:avatar': [File];

  'route:go': [string];
  'route:back': [];
  'route:forward': [];

  'chats:select': [number];
  'chats:request': [];
  'chats:create': [{ title: string; userLogin?: string }];
  'chats:add-user': [{ login: string; chatId: number }];
  'chats:remove-user': [{ userId: number; chatId: number }];
  'chats:delete': [number];
  'chats:rename': [{ chatId: number; title: string }];
  'chats:avatar': [{ chatId: number; file: File }];
  'chats:users:request': [number];
  'message:send': [{ chatId: number; message: string }];

  'chats:update': [ChatPreview[]];
  'chats:users:update': [ChatUser[]];
  'chats:user-not-found': [string];
  'messages:update': [Message[]];
  'chat:active': [number];
};
