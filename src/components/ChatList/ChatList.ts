import Block from "../../core/Block";
import { ChatListProps } from "./types";

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
        const item = target.closest<HTMLElement>("[data-chat-id]");
        if (!item) {
            return;
        }
        const chatId = Number(item.dataset.chatId);
        this.props.onSelect?.(chatId);
    }

    render(): HTMLElement {
        const items = this.props.chats
            .map((chat) => {
                const isActive = chat.id === this.props.activeChatId;
                return `
                    <li class="chat-list__item ${isActive ? "chat-list__item--active" : ""}" data-chat-id="${chat.id}">
                        <div class="chat-list__title">${chat.title}</div>
                        <div class="chat-list__last">${chat.lastMessage}</div>
                        ${chat.unread ? `<span class="chat-list__badge">${chat.unread}</span>` : ""}
                    </li>
                `;
            })
            .join("");

        const template = `
            <ul class="chat-list">
                ${items}
            </ul>
        `;
        return this.compile(template, {});
    }
}
