import type { AuthData, RegisterData, User } from './services/authService';
import type { PasswordData, SettingsData } from './services/settingsService';
import type { ChatPreview, Message, ChatUser } from './services/chatService';

export const APP_EVENTS = {
  authLogin: 'auth:login',
  authRegister: 'auth:register',
  authLogout: 'auth:logout',
  authUser: 'auth:user',
  authLoginFailed: 'auth:login-failed',

  settingsUpdate: 'settings:update',
  settingsPassword: 'settings:password',
  settingsAvatar: 'settings:avatar',

  routeGo: 'route:go',
  routeBack: 'route:back',
  routeForward: 'route:forward',

  chatsSelect: 'chats:select',
  chatsRequest: 'chats:request',
  chatsCreate: 'chats:create',
  chatsAddUser: 'chats:add-user',
  chatsRemoveUser: 'chats:remove-user',
  chatsDelete: 'chats:delete',
  chatsRename: 'chats:rename',
  chatsAvatar: 'chats:avatar',
  chatsUsersRequest: 'chats:users:request',
  chatsUpdate: 'chats:update',
  chatsUsersUpdate: 'chats:users:update',
  chatsUserNotFound: 'chats:user-not-found',

  messageSend: 'message:send',
  messagesUpdate: 'messages:update',
  chatActive: 'chat:active',

  uiError: 'ui:error',
} as const;

export type AppEvents = {
  [APP_EVENTS.authLogin]: [AuthData];
  [APP_EVENTS.authRegister]: [RegisterData];
  [APP_EVENTS.authLogout]: [];
  [APP_EVENTS.authUser]: [User | null];
  [APP_EVENTS.authLoginFailed]: [string];

  [APP_EVENTS.settingsUpdate]: [SettingsData];
  [APP_EVENTS.settingsPassword]: [PasswordData];
  [APP_EVENTS.settingsAvatar]: [File];

  [APP_EVENTS.routeGo]: [string];
  [APP_EVENTS.routeBack]: [];
  [APP_EVENTS.routeForward]: [];

  [APP_EVENTS.chatsSelect]: [number];
  [APP_EVENTS.chatsRequest]: [];
  [APP_EVENTS.chatsCreate]: [{ title: string; userLogin?: string }];
  [APP_EVENTS.chatsAddUser]: [{ login: string; chatId: number }];
  [APP_EVENTS.chatsRemoveUser]: [{ userId: number; chatId: number }];
  [APP_EVENTS.chatsDelete]: [number];
  [APP_EVENTS.chatsRename]: [{ chatId: number; title: string }];
  [APP_EVENTS.chatsAvatar]: [{ chatId: number; file: File }];
  [APP_EVENTS.chatsUsersRequest]: [number];
  [APP_EVENTS.messageSend]: [{ chatId: number; message: string }];

  [APP_EVENTS.chatsUpdate]: [ChatPreview[]];
  [APP_EVENTS.chatsUsersUpdate]: [ChatUser[]];
  [APP_EVENTS.chatsUserNotFound]: [string];
  [APP_EVENTS.messagesUpdate]: [Message[]];
  [APP_EVENTS.chatActive]: [number];

  [APP_EVENTS.uiError]: [string];
};
