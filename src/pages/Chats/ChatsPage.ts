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

  private isTitleEditing = false;

  private draftChatTitle = '';

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
    this.isTitleEditing = false;
    this.draftChatTitle = this.activeChat?.title ?? '';
    mediator.emit('chats:users:request', this.activeChatId);
    this.setProps({ editorVersion: Date.now() });
  }

  private closeChatEditor(): void {
    this.isChatEditorOpen = false;
    this.isTitleEditing = false;
    this.setProps({ editorVersion: Date.now() });
  }

  private startTitleEditing(): void {
    this.isTitleEditing = true;
    this.draftChatTitle = this.activeChat?.title ?? '';
    this.setProps({ editorVersion: Date.now() });
  }

  private stopTitleEditing(): void {
    this.isTitleEditing = false;
    this.draftChatTitle = this.activeChat?.title ?? '';
    this.setProps({ editorVersion: Date.now() });
  }

  private saveTitleChange(): void {
    if (!this.activeChatId) {
      return;
    }

    const title = this.draftChatTitle.trim();
    if (!title || title === this.activeChat?.title) {
      this.stopTitleEditing();
      return;
    }

    mediator.emit('chats:rename', { chatId: this.activeChatId, title });
    this.isTitleEditing = false;
    this.setProps({ editorVersion: Date.now() });
  }

  private handleTitleInput(value: string): void {
    this.draftChatTitle = value;
  }

  private handleChatAvatarUpload(file: File): void {
    if (!this.activeChatId) {
      return;
    }

    mediator.emit('chats:avatar', { chatId: this.activeChatId, file });
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
          <button type="button" id="close-chat-editor-btn" class="chat-editor__close-btn" aria-label="Закрыть">✖</button>

          <button type="button" id="chat-avatar-trigger" class="chat-editor__avatar-btn" aria-label="Изменить аватар чата">
            <img src="${this.activeChat?.avatar ? `https://ya-praktikum.tech/api/v2/resources${this.activeChat.avatar}` : '/data/users/1/avatar.jpg'}" alt="Chat avatar" class="chat-editor__main-avatar" />
          </button>
          <input id="chat-avatar-input" class="chat-editor__avatar-input" name="chat-avatar" type="file" accept="image/*" />

          <div class="chat-editor__title-wrap ${this.isTitleEditing ? 'chat-editor__title-wrap--editing' : ''}">
            <input
              id="chat-title-input"
              class="chat-editor__title-input"
              type="text"
              value="${this.draftChatTitle || this.activeChat?.title || ''}"
              ${this.isTitleEditing ? '' : 'readonly'}
            />
            ${this.isTitleEditing
    ? '<button type="button" id="chat-title-save" class="chat-editor__title-save" aria-label="Сохранить">✓</button>'
    : ''}
          </div>

          <ul class="chat-editor__users">${usersMarkup}</ul>

          <form class="chat-editor__form" id="chat-editor-form">
            <input class="field__input" name="chat-login" type="text" placeholder="Логин пользователя" />
            ${this.userError ? `<span class="chat-editor__error">${this.userError}</span>` : ''}
            <div class="chat-editor__actions">
              <button type="submit" class="btn submit-btn">add user</button>
              <button type="button" id="delete-chat-btn" class="btn alt-btn">delete chat</button>
            </div>
          </form>
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

    const titleInput = element.querySelector<HTMLInputElement>('#chat-title-input');
    titleInput?.addEventListener('click', () => this.startTitleEditing());
    titleInput?.addEventListener('input', (event) => {
      const { value } = event.currentTarget as HTMLInputElement;
      this.handleTitleInput(value);
    });
    titleInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.saveTitleChange();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        this.stopTitleEditing();
      }
    });

    if (this.isTitleEditing && titleInput) {
      setTimeout(() => {
        titleInput.focus();
        titleInput.selectionStart = titleInput.value.length;
        titleInput.selectionEnd = titleInput.value.length;
      }, 0);
    }

    const titleSaveBtn = element.querySelector<HTMLButtonElement>('#chat-title-save');
    titleSaveBtn?.addEventListener('click', () => this.saveTitleChange());

    const avatarTriggerBtn = element.querySelector<HTMLButtonElement>('#chat-avatar-trigger');
    const avatarInput = element.querySelector<HTMLInputElement>('#chat-avatar-input');
    avatarTriggerBtn?.addEventListener('click', () => {
      avatarInput?.click();
    });
    avatarInput?.addEventListener('change', () => {
      const file = avatarInput.files?.[0];
      if (file) {
        this.handleChatAvatarUpload(file);
      }
    });

    const editorForm = element.querySelector<HTMLFormElement>('#chat-editor-form');
    editorForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      this.addUserByLogin(event.currentTarget as HTMLFormElement);
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
