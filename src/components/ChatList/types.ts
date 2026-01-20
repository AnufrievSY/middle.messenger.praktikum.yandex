import { BlockProps } from "../../core/Block";
import { ChatPreview } from "../../services/chatService";

export type ChatListProps = BlockProps & {
    chats: ChatPreview[];
    activeChatId?: number | null;
    onSelect?: (chatId: number) => void;
};
