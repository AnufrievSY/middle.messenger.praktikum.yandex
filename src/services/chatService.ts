export type ChatPreview = {
    id: number;
    title_name: string;
    title_date: string;
    not_read_count: number;
    last_message?: { author: string; text: string };
    avatar: string;
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
    {
        id: 1,
        title_name: "User1",
        title_date: "10:21",
        not_read_count: 0,
        last_message: { author: "User0", text: "SecondMsg" },
        avatar: "/data/users/1/avatar.jpg",
    },
    {
        id: 2,
        title_name: "User2",
        title_date: "09:10",
        not_read_count: 7,
        last_message: { author: "User2", text: "FirstMsg" },
        avatar: "/data/users/2/avatar.jpg",
    },
    {
        id: 3,
        title_name: "User3",
        title_date: "10:21",
        not_read_count: 1,
        last_message: { author: "User0", text: "SecondMsg" },
        avatar: "/data/users/1/avatar.jpg",
    },
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
