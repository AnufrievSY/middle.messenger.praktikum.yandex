import BasePage from '../BasePage';
import { ChatList } from '../../components/ChatList';
import { ChatMessage } from '../../components/ChatMessage';
import { MessageForm } from '../../components/MessageForm';
import mediator from '../../mediator/AppMediator';
import { ChatPreview, Message } from '../../controllers/ChatController';
import { ChatUser } from '../../services/chatService';

export default class ChatsPage extends BasePage {
  private messages: Message[] = [];

  private chats: ChatPreview[] = [];

  private chatUsers: ChatUser[] = [];

  private activeChatId: number | null = null;

  private activeChat: ChatPreview | null = null;

  private isChatEditorOpen = false;

  private chatList: ChatList;

  private messageForm: MessageForm;

  private userError = '';

  constructor() {
    const chatList = new ChatList({
      chats: [],
      onSelect: (chatId) => mediator.emit('chats:select', chatId),
    });
    const messageForm = new MessageForm({
      onSubmit: (message) => {
        if (this.activeChatId) {
          mediator.emit('message:send', { chatId: this.activeChatId, message });
        }
      },
    });

    super({
      chatList,
      messageForm,
      messagesVersion: 0,
      editorVersion: 0,
    });
    this.chatList = chatList;
    this.messageForm = messageForm;

    mediator.on('chats:update', (chats: ChatPreview[]) => {
      this.chats = chats;
      this.activeChat = this.chats.find((chat) => chat.id === this.activeChatId) ?? null;
      this.chatList.setProps({ chats: this.chats, activeChatId: this.activeChatId });
      this.setProps({ editorVersion: Date.now() });
    });

    mediator.on('messages:update', (messages: Message[]) => {
      this.messages = messages;
      this.setProps({ messagesVersion: Date.now() });
    });

    mediator.on('chats:users:update', (users: ChatUser[]) => {
      this.chatUsers = users;
      this.userError = '';
      this.setProps({ editorVersion: Date.now(), messagesVersion: Date.now() });
    });

    mediator.on('chats:user-not-found', (message: string) => {
      this.userError = message;
      this.setProps({ editorVersion: Date.now() });
    });

    mediator.on('chat:active', (chatId: number) => {
      this.activeChatId = chatId;
      this.activeChat = this.chats.find((chat) => chat.id === chatId) ?? null;
      this.chatList.setProps({ activeChatId: chatId });
      this.setProps({ messagesVersion: Date.now(), editorVersion: Date.now() });
    });

    mediator.emit('chats:request');
  }

  private handleCreateChat(): void {
    const title = window.prompt('Название чата');
    if (!title) {
      return;
    }

    const userLogin = window.prompt('Логин пользователя (необязательно)') ?? '';
    mediator.emit('chats:create', { title, userLogin });
  }

  private openChatEditor(): void {
    if (!this.activeChatId) {
      return;
    }

    this.isChatEditorOpen = true;
    mediator.emit('chats:users:request', this.activeChatId);
    this.setProps({ editorVersion: Date.now() });
  }

  private closeChatEditor(): void {
    this.isChatEditorOpen = false;
    this.setProps({ editorVersion: Date.now() });
  }

  private addUserByLogin(form: HTMLFormElement): void {
    if (!this.activeChatId) {
      return;
    }

    const input = form.querySelector<HTMLInputElement>('input[name="chat-login"]');
    if (!input) {
      return;
    }

    const login = input.value.trim();
    if (!login) {
      return;
    }

    mediator.emit('chats:add-user', { login, chatId: this.activeChatId });
    input.value = '';
  }

  private renameChat(form: HTMLFormElement): void {
    if (!this.activeChatId) {
      return;
    }

    const input = form.querySelector<HTMLInputElement>('input[name="chat-title"]');
    if (!input) {
      return;
    }

    const title = input.value.trim();
    if (!title) {
      return;
    }

    mediator.emit('chats:rename', { chatId: this.activeChatId, title });
  }

  private updateChatAvatar(form: HTMLFormElement): void {
    if (!this.activeChatId) {
      return;
    }

    const input = form.querySelector<HTMLInputElement>('input[name="chat-avatar"]');
    const file = input?.files?.[0];
    if (!file) {
      return;
    }

    mediator.emit('chats:avatar', { chatId: this.activeChatId, file });
  }

  private removeUser(userId: number): void {
    if (!this.activeChatId) {
      return;
    }
    mediator.emit('chats:remove-user', { userId, chatId: this.activeChatId });
  }

  private deleteActiveChat(): void {
    if (!this.activeChatId) {
      return;
    }
    mediator.emit('chats:delete', this.activeChatId);
    this.closeChatEditor();
    this.chatUsers = [];
    this.setProps({ editorVersion: Date.now() });
  }

  private renderChatEditor(): string {
    if (!this.isChatEditorOpen || !this.activeChatId) {
      return '';
    }

    const usersMarkup = this.chatUsers
      .map((user) => {
        const userName = `${user.first_name} ${user.second_name}`.trim() || user.login;
        const avatar = user.avatar
          ? `https://ya-praktikum.tech/api/v2/resources${user.avatar}`
          : '/data/users/1/avatar.jpg';

        return `
          <li class="chat-editor__user" data-user-id="${user.id}">
            <button type="button" class="chat-editor__remove-user" data-remove-user-id="${user.id}">✖</button>
            <img src="${avatar}" alt="${userName}" class="chat-editor__user-avatar" />
            <span class="chat-editor__user-name">${userName}</span>
          </li>
        `;
      })
      .join('');

    return `
      <div class="chat-editor-overlay" id="chat-editor-overlay">
        <aside class="chat-editor chat-editor--modal" role="dialog" aria-modal="true" aria-label="Настройки чата">
          <h3 class="chat-editor__title">${this.activeChat?.title ?? 'ChatName'}</h3>

          <form class="chat-editor__form" id="chat-rename-form">
            <input class="field__input" name="chat-title" type="text" placeholder="Новое название чата" value="${this.activeChat?.title ?? ''}" />
            <button type="submit" class="btn submit-btn">Сохранить название</button>
          </form>

          <form class="chat-editor__form" id="chat-avatar-form">
            <input class="field__input" name="chat-avatar" type="file" accept="image/*" />
            <button type="submit" class="btn submit-btn">Обновить аватар</button>
          </form>

          <ul class="chat-editor__users">${usersMarkup}</ul>

          <form class="chat-editor__form" id="chat-editor-form">
            <input class="field__input" name="chat-login" type="text" placeholder="Логин пользователя" />
            ${this.userError ? `<span class="chat-editor__error">${this.userError}</span>` : ''}
            <div class="chat-editor__actions">
              <button type="submit" class="btn submit-btn">add user</button>
              <button type="button" id="delete-chat-btn" class="btn alt-btn">delete chat</button>
            </div>
          </form>

          <button type="button" id="close-chat-editor-btn" class="btn alt-btn">Закрыть</button>
        </aside>
      </div>
    `;
  }

  private formatMessageTime(isoTime: string): string {
    const date = new Date(isoTime);
    if (Number.isNaN(date.getTime())) {
      return '--:--';
    }

    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private getMessageAuthor(message: Message): { author: string; avatar: string } {
    const app = window as unknown as {
      app?: {
        auth?: {
          getCurrentUser: () => {
            id: number;
            first_name: string;
            second_name: string;
            login: string;
            avatar: string | null;
          } | null;
        };
      };
    };

    const currentUser = app.app?.auth?.getCurrentUser?.();
    if (currentUser?.id === message.user_id) {
      const fullName = `${currentUser.first_name} ${currentUser.second_name}`.trim();
      return {
        author: fullName || currentUser.login,
        avatar: currentUser.avatar
          ? `https://ya-praktikum.tech/api/v2/resources${currentUser.avatar}`
          : '/data/users/1/avatar.jpg',
      };
    }

    const chatUser = this.chatUsers.find((user) => user.id === message.user_id);
    if (!chatUser) {
      return {
        author: `User #${message.user_id}`,
        avatar: '/data/users/1/avatar.jpg',
      };
    }

    const author = `${chatUser.first_name} ${chatUser.second_name}`.trim() || chatUser.login;
    return {
      author,
      avatar: chatUser.avatar
        ? `https://ya-praktikum.tech/api/v2/resources${chatUser.avatar}`
        : '/data/users/1/avatar.jpg',
    };
  }

  private renderMessages(): string {
    const messages = this.messages ?? [];
    if (!messages.length) {
      return '<div class="chat__body_empty">No messages yet</div>';
    }

    const app = window as unknown as {
      app?: { auth?: { getCurrentUser: () => { id: number } | null } };
    };
    const currentUserId = app.app?.auth?.getCurrentUser?.()?.id;

    return `
            <div class="chat__body_messages">
                ${messages.map((message) => {
    const sender = this.getMessageAuthor(message);
    return new ChatMessage({
      text: message.content ?? '',
      time: this.formatMessageTime(message.time),
      isMine: message.user_id === currentUserId,
      status: message.status,
      author: sender.author,
      avatar: sender.avatar,
    }).getContent().outerHTML;
  }).join('')}
            </div>
        `;
  }

  render(): HTMLElement {
    const template = `
            <section class="chats-page {{editorClass}}">
                <section class="chats-section">
                    <div class="chat-actions">
                        <a href="/settings" class="btn alt-btn">Профиль</a>
                        <button id="create-chat-btn" class="btn submit-btn" type="button">Создать чат</button>
                    </div>
                    {{{chatList}}}
                </section>
                <section class="chat-section">
                    <div class="chat__header">
                        <img class="chat__header__avatar" src="{{chatAvatar}}" alt="Изображение пользователя" />
                        <button id="chat-editor-open" class="chat__header_title_name chat__header_title_name--button" type="button">{{chatTitle}}</button>
                    </div>
                    <div class="chat__body">
                        {{messages}}
                    </div>
                    {{{messageForm}}}
                    {{chatEditor}}
                </section>
            </section>
            <div class="page-bg"></div>
        `;

    const element = this.compile(template, {
      chatList: this.chatList,
      messageForm: this.messageForm,
      messages: this.renderMessages(),
      chatEditor: this.renderChatEditor(),
      chatAvatar: this.activeChat?.avatar
        ? `https://ya-praktikum.tech/api/v2/resources${this.activeChat.avatar}`
        : '/data/users/1/avatar.jpg',
      chatTitle: this.activeChat?.title ?? 'Select chat',
      editorClass: this.isChatEditorOpen ? 'chats-page--modal-open' : '',
    });

    const createChatBtn = element.querySelector<HTMLButtonElement>('#create-chat-btn');
    createChatBtn?.addEventListener('click', () => this.handleCreateChat());

    const openEditorBtn = element.querySelector<HTMLButtonElement>('#chat-editor-open');
    openEditorBtn?.addEventListener('click', () => this.openChatEditor());

    const overlay = element.querySelector<HTMLElement>('#chat-editor-overlay');
    overlay?.addEventListener('click', (event) => {
      if (event.target === overlay) {
        this.closeChatEditor();
      }
    });

    const closeBtn = element.querySelector<HTMLButtonElement>('#close-chat-editor-btn');
    closeBtn?.addEventListener('click', () => this.closeChatEditor());

    const editorForm = element.querySelector<HTMLFormElement>('#chat-editor-form');
    editorForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      this.addUserByLogin(event.currentTarget as HTMLFormElement);
    });

    const renameForm = element.querySelector<HTMLFormElement>('#chat-rename-form');
    renameForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      this.renameChat(event.currentTarget as HTMLFormElement);
    });

    const avatarForm = element.querySelector<HTMLFormElement>('#chat-avatar-form');
    avatarForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      this.updateChatAvatar(event.currentTarget as HTMLFormElement);
    });

    const deleteBtn = element.querySelector<HTMLButtonElement>('#delete-chat-btn');
    deleteBtn?.addEventListener('click', () => this.deleteActiveChat());

    const removeButtons = Array.from(
      element.querySelectorAll<HTMLButtonElement>('[data-remove-user-id]'),
    );
    removeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const userId = Number(button.dataset.removeUserId);
        if (!Number.isNaN(userId)) {
          this.removeUser(userId);
        }
      });
    });

    return element;
  }
}
