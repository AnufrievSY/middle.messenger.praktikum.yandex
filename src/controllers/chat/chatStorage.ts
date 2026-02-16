import { ChatPreview, Message } from '../../services/chatTypes';
import { getStorageJSON, removeStorageItem, setStorageJSON } from '../../utils/storage';

const STORAGE_PREFIX = 'chat_messages_';
const CHATS_META_STORAGE = 'chat_meta_overrides';

export type ChatMetaOverride = {
  title?: string;
  avatar?: string | null;
};

export default class ChatStorage {
  private chatMetaOverrides = new Map<number, ChatMetaOverride>();

  constructor() {
    this.chatMetaOverrides = this.loadChatMetaOverrides();
  }

  getStoredMessages(chatId: number): Message[] {
    return getStorageJSON<Message[]>(sessionStorage, `${STORAGE_PREFIX}${chatId}`, []);
  }

  storeMessages(chatId: number, messages: Message[]): void {
    setStorageJSON(sessionStorage, `${STORAGE_PREFIX}${chatId}`, messages);
  }

  clearStoredMessages(chatId: number): void {
    removeStorageItem(sessionStorage, `${STORAGE_PREFIX}${chatId}`);
  }

  applyChatMetaOverrides(chats: ChatPreview[]): ChatPreview[] {
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

  upsertChatMetaOverride(chatId: number, patch: ChatMetaOverride): ChatMetaOverride {
    const current = this.chatMetaOverrides.get(chatId) ?? {};
    const next = {
      ...current,
      ...patch,
    };

    this.chatMetaOverrides.set(chatId, next);
    this.storeChatMetaOverrides();

    return next;
  }

  private loadChatMetaOverrides(): Map<number, ChatMetaOverride> {
    const parsed = getStorageJSON<Record<string, ChatMetaOverride>>(
      localStorage,
      CHATS_META_STORAGE,
      {},
    );
    const entries = Object.entries(parsed).map(([key, value]) => [Number(key), value] as const);
    return new Map(entries);
  }

  private storeChatMetaOverrides(): void {
    const object = [...this.chatMetaOverrides.entries()].reduce<Record<string, ChatMetaOverride>>(
      (acc, [chatId, value]) => {
        acc[String(chatId)] = value;
        return acc;
      },
      {},
    );

    setStorageJSON(localStorage, CHATS_META_STORAGE, object);
  }
}
