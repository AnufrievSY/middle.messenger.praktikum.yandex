import Block from '../../core/Block';
import { ChatListProps } from './types';

export default class ChatList extends Block<ChatListProps> {
  constructor(props: ChatListProps) {
    super({
      ...props,
      events: {
        click: (event) => this.handleClick(event),
      },
    });
  }

  private handleClick(event: Event): void {
    const target = event.target as HTMLElement;
    const item = target.closest<HTMLElement>('[data-chat-id]');
    if (!item) {
      return;
    }
    event.preventDefault();
    const chatId = Number(item.dataset.chatId);
    this.props.onSelect?.(chatId);
  }

  render(): HTMLElement {
    const items = this.props.chats
      .map((chat) => {
        const isActive = chat.id === this.props.activeChatId;
        const avatarSrc = chat.avatar
          ? `https://ya-praktikum.tech/api/v2/resources${chat.avatar}`
          : '/data/users/1/avatar.jpg';

        return `
                    <button class="chat-item ${isActive ? 'chat-item--active' : ''}" type="button" data-chat-id="${chat.id}">
                        <img class="chat-preview__avatar" src="${avatarSrc}" alt="Изображение пользователя ${chat.title}" />
                        <div class="chat-preview__title">
                            <span class="chat-preview__title_name">${chat.title}</span>
                        </div>
                        <div class="chat-preview__subtitle">
                            <span class="chat-preview__subtitle_last-message">
                                ${chat.last_message ? `${chat.last_message.user.first_name}: ${chat.last_message.content}` : 'No messages yet'}
                            </span>
                            ${chat.unread_count ? `<span class="chat-preview__subtitle_counter">${chat.unread_count}</span>` : ''}
                        </div>
                    </button>
                `;
      })
      .join('');

    const template = `
            <div>
                ${items}
            </div>
        `;
    return this.compile(template, {});
  }
}
