import BasePage from '../BasePage';
import { ChatList } from '../../components/ChatList';
import { ChatMessage } from '../../components/ChatMessage';
import { MessageForm } from '../../components/MessageForm';
import mediator from '../../mediator/AppMediator';
import { ChatPreview, Message } from '../../controllers/ChatController';

export default class ChatsPage extends BasePage {
  private messages: Message[] = [];

  private chats: ChatPreview[] = [];

  private activeChatId: number | null = null;

  private activeChat: ChatPreview | null = null;

  private chatList: ChatList;

  private messageForm: MessageForm;

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

    super({ chatList, messageForm, messagesVersion: 0 });
    this.chatList = chatList;
    this.messageForm = messageForm;

    mediator.on('chats:update', (chats: ChatPreview[]) => {
      this.chats = chats;
      this.chatList.setProps({ chats: this.chats, activeChatId: this.activeChatId });
    });

    mediator.on('messages:update', (messages: Message[]) => {
      this.messages = messages;
      this.setProps({ messagesVersion: Date.now() });
    });

    mediator.on('chat:active', (chatId: number) => {
      this.activeChatId = chatId;
      this.activeChat = this.chats.find((chat) => chat.id === chatId) ?? null;
      this.chatList.setProps({ activeChatId: chatId });
      this.setProps({ messagesVersion: Date.now() });
    });

    mediator.emit('chats:request');
  }

  private handleCreateChat(): void {
    const title = window.prompt('Название чата');
    if (title) {
      mediator.emit('chats:create', title);
    }
  }

  private handleAddUser(): void {
    if (!this.activeChatId) {
      return;
    }
    const userId = Number(window.prompt('ID пользователя для добавления'));
    if (!Number.isNaN(userId)) {
      mediator.emit('chats:add-user', { userId, chatId: this.activeChatId });
    }
  }

  private handleRemoveUser(): void {
    if (!this.activeChatId) {
      return;
    }
    const userId = Number(window.prompt('ID пользователя для удаления'));
    if (!Number.isNaN(userId)) {
      mediator.emit('chats:remove-user', { userId, chatId: this.activeChatId });
    }
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
                ${messages.map((message) => new ChatMessage({
    text: message.content ?? '',
    time: new Date(message.time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    isMine: message.user_id === currentUserId,
  }).getContent().outerHTML).join('')}
            </div>
        `;
  }

  render(): HTMLElement {
    const template = `
            <section class="chats-page">
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
                        <div class="chat__header_title_name">{{chatTitle}}</div>
                        <div class="chat__header_settings">
                            <button id="add-user-btn" class="btn alt-btn" type="button">+ Пользователь</button>
                            <button id="remove-user-btn" class="btn alt-btn" type="button">- Пользователь</button>
                        </div>
                    </div>
                    <div class="chat__body">
                        {{messages}}
                    </div>
                    {{{messageForm}}}
                </section>
            </section>
            <div class="page-bg"></div>
        `;

    const element = this.compile(template, {
      chatList: this.chatList,
      messageForm: this.messageForm,
      messages: this.renderMessages(),
      chatAvatar: this.activeChat?.avatar ? `https://ya-praktikum.tech/api/v2/resources${this.activeChat.avatar}` : '/data/users/1/avatar.jpg',
      chatTitle: this.activeChat?.title ?? 'Select chat',
    });

    const createChatBtn = element.querySelector<HTMLButtonElement>('#create-chat-btn');
    createChatBtn?.addEventListener('click', () => this.handleCreateChat());

    const addUserBtn = element.querySelector<HTMLButtonElement>('#add-user-btn');
    addUserBtn?.addEventListener('click', () => this.handleAddUser());

    const removeUserBtn = element.querySelector<HTMLButtonElement>('#remove-user-btn');
    removeUserBtn?.addEventListener('click', () => this.handleRemoveUser());

    return element;
  }
}
