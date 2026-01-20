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

    private async handleChatsRequest(): Promise<void> {
        console.log("[ChatController] loading chats");
        const chats = await this.service.getChats();
        console.log("[ChatController] chats loaded", { count: chats.length });
        mediator.emit("chats:update", chats);
        if (chats.length > 0) {
            await this.selectChat(chats[0].id);
        }
    }

    private async handleChatSelect(chatId: number): Promise<void> {
        console.log("[ChatController] chat selected", { chatId });
        await this.selectChat(chatId);
    }

    private async handleMessageSend(payload: { chatId: number; message: string }): Promise<void> {
        if (!payload.message.trim()) {
            return;
        }
        await this.service.sendMessage(payload.chatId, payload.message);
        const messages = await this.service.getMessages(payload.chatId);
        mediator.emit("messages:update", messages);
    }

    private async selectChat(chatId: number): Promise<void> {
        this.activeChatId = chatId;
        console.log("[ChatController] loading messages", { chatId });
        const messages = await this.service.getMessages(chatId);
        console.log("[ChatController] messages loaded", { chatId, count: messages.length });
        mediator.emit("messages:update", messages);
        mediator.emit("chat:active", chatId);
    }
}

export type { ChatPreview, Message };
