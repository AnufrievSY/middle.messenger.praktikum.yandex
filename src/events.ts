import type { AuthData, RegisterData } from './services/authService';
import type { SettingsData } from './services/settingsService';
import type { ChatPreview, Message } from './services/chatService';

export type AppEvents = {
  'auth:login': [AuthData];
  'auth:register': [RegisterData];
  'settings:update': [SettingsData];

  'route:go': [string];

  'chats:select': [number];
  'chats:request': [];
  'message:send': [{ chatId: number; message: string }];

  'chats:update': [ChatPreview[]];
  'messages:update': [Message[]];
  'chat:active': [number];
};
