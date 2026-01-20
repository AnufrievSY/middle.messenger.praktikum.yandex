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
            this.chatList.setProps({ activeChatId: chatId });
        });

        mediator.emit("chats:request");
    }

    private renderMessages(): string {
        if (!this.messages.length) {
            return '<p class="chat-empty">Выберите чат, чтобы начать общение</p>';
        }
        return this.messages
            .map((message) => new ChatMessage(message).getContent().outerHTML)
            .join("");
    }

    render(): HTMLElement {
        const template = `
            <section class="page page--chats">
                <aside class="sidebar">
                    <h2 class="sidebar__title">Чаты</h2>
                    {{{chatList}}}
                    <a class="nav-link sidebar__link" href="#/settings">Профиль</a>
                </aside>
                <main class="chat">
                    <header class="chat__header">
                        <h2 class="chat__title">Переписка</h2>
                        <nav class="chat__nav">
                            <a class="nav-link" href="#/login">Выйти</a>
                        </nav>
                    </header>
                    <div class="chat__feed">
                        {{messages}}
                    </div>
                    <div class="chat__composer">
                        {{{messageForm}}}
                    </div>
                </main>
            </section>
        `;
        return this.compile(template, {
            chatList: this.chatList,
            messageForm: this.messageForm,
            messages: this.renderMessages(),
        });
    }
}
