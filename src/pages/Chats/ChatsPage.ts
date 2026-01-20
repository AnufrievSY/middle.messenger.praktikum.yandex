import BasePage from "../BasePage";
import ChatList from "../../components/ChatList";
import ChatMessage from "../../components/ChatMessage";
import MessageForm from "../../components/MessageForm";
import mediator from "../../mediator/AppMediator";
import { ChatPreview, Message } from "../../controllers/ChatController";

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
            onSelect: (chatId) => mediator.emit("chats:select", chatId),
        });
        const messageForm = new MessageForm({
            onSubmit: (message) => {
                if (this.activeChatId) {
                    mediator.emit("message:send", { chatId: this.activeChatId, message });
                }
            },
        });
        super({ chatList, messageForm });
        this.chatList = chatList;
        this.messageForm = messageForm;

        mediator.on("chats:update", (chats: ChatPreview[]) => {
            this.chats = chats;
            this.chatList.setProps({ chats: this.chats, activeChatId: this.activeChatId });
        });

        mediator.on("messages:update", (messages: Message[]) => {
            this.messages = messages;
            this.setProps({});
        });

        mediator.on("chat:active", (chatId: number) => {
            this.activeChatId = chatId;
            this.activeChat = this.chats.find((chat) => chat.id === chatId) ?? null;
            this.chatList.setProps({ activeChatId: chatId });
        });

        mediator.emit("chats:request");
    }

    private renderMessages(): string {
        const messages = this.messages ?? [];
        if (!messages.length) {
            return '<div class="chat__body_empty">No messages yet</div>';
        }
        return `
            <div class="chat__body_messages">
                ${messages.map((message) => new ChatMessage(message).getContent().outerHTML).join("")}
            </div>
        `;
    }

    render(): HTMLElement {
        const template = `
            <section class="chats-page">
                <section class="chats-section">
                    {{{chatList}}}
                </section>
                <section class="chat-section">
                    <div class="chat__header">
                        <img class="chat__header__avatar" src="{{chatAvatar}}" alt="Изображение пользователя" />
                        <div class="chat__header_title_name">{{chatTitle}}</div>
                        <div class="chat__header_settings"></div>
                    </div>
                    <div class="chat__body">
                        {{messages}}
                    </div>
                    {{{messageForm}}}
                </section>
            </section>
            <div class="page-bg"></div>
        `;
        return this.compile(template, {
            chatList: this.chatList,
            messageForm: this.messageForm,
            messages: this.renderMessages(),
            chatAvatar: this.activeChat?.avatar ?? "/data/users/1/avatar.jpg",
            chatTitle: this.activeChat?.title_name ?? "Select chat",
        });
    }
}
