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
      console.log('[ChatList] click ignored: no chat item', { target });
      return;
    }
    event.preventDefault();
    const chatId = Number(item.dataset.chatId);
    console.log('[ChatList] chat selected', { chatId });
    this.props.onSelect?.(chatId);
  }

  render(): HTMLElement {
    const items = this.props.chats
      .map((chat) => {
        const isActive = chat.id === this.props.activeChatId;
        return `
                    <button class="chat-item ${isActive ? 'chat-item--active' : ''}" type="button" data-chat-id="${chat.id}">
                        <img class="chat-preview__avatar" src="${chat.avatar}" alt="Изображение пользователя ${chat.title_name}" />
                        <div class="chat-preview__title">
                            <span class="chat-preview__title_name">${chat.title_name}</span>
                            <span class="chat-preview__title_date">${chat.title_date}</span>
                        </div>
                        <div class="chat-preview__subtitle">
                            <span class="chat-preview__subtitle_last-message">
                                ${chat.last_message ? `${chat.last_message.author}: ${chat.last_message.text}` : 'No messages yet'}
                            </span>
                            ${chat.not_read_count ? `<span class="chat-preview__subtitle_counter">${chat.not_read_count}</span>` : ''}
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
