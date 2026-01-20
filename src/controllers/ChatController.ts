import mediator from "../mediator/AppMediator";
import ChatService, { ChatPreview, Message } from "../services/chatService";

export default class ChatController {
    private service: ChatService;
    private activeChatId: number | null = null;

    constructor(service: ChatService) {
        this.service = service;
        mediator.on("chats:request", this.handleChatsRequest.bind(this));
        mediator.on("chats:select", this.handleChatSelect.bind(this));
        mediator.on("message:send", this.handleMessageSend.bind(this));
    }

    private handleChatsRequest(): void {
        const chats = this.service.getChats();
        mediator.emit("chats:update", chats);
        if (chats.length > 0) {
            this.selectChat(chats[0].id);
        }
    }

    private handleChatSelect(chatId: number): void {
        this.selectChat(chatId);
    }

    private handleMessageSend(payload: { chatId: number; message: string }): void {
        if (!payload.message.trim()) {
            return;
        }
        this.service.sendMessage(payload.chatId, payload.message);
        const messages = this.service.getMessages(payload.chatId);
        mediator.emit("messages:update", messages);
    }

    private selectChat(chatId: number): void {
        this.activeChatId = chatId;
        const messages = this.service.getMessages(chatId);
        mediator.emit("messages:update", messages);
        mediator.emit("chat:active", chatId);
    }
}

export type { ChatPreview, Message };
