export type ChatPreview = {
    id: number;
    title: string;
    lastMessage: string;
    unread: number;
};

export type Message = {
    id: number;
    chatId: number;
    author: string;
    text: string;
    time: string;
    isMine?: boolean;
};

const chats: ChatPreview[] = [
    { id: 1, title: "Work", lastMessage: "План на сегодня готов", unread: 2 },
    { id: 2, title: "Family", lastMessage: "Ужин в 19:00", unread: 0 },
    { id: 3, title: "Design", lastMessage: "Новый макет готов", unread: 5 },
];

const messages: Message[] = [
    { id: 1, chatId: 1, author: "Анна", text: "План на сегодня готов", time: "10:15" },
    { id: 2, chatId: 1, author: "Вы", text: "Отлично, спасибо!", time: "10:17", isMine: true },
    { id: 3, chatId: 2, author: "Мама", text: "Ужин в 19:00", time: "18:20" },
    { id: 4, chatId: 3, author: "Алексей", text: "Новый макет готов", time: "09:30" },
    { id: 5, chatId: 3, author: "Вы", text: "Проверю сегодня", time: "09:45", isMine: true },
];

export default class ChatService {
    getChats(): ChatPreview[] {
        return chats;
    }

    getMessages(chatId: number): Message[] {
        return messages.filter((message) => message.chatId === chatId);
    }

    sendMessage(chatId: number, text: string): Message {
        const message: Message = {
            id: messages.length + 1,
            chatId,
            author: "Вы",
            text,
            time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
            isMine: true,
        };
        messages.push(message);
        return message;
    }
}
