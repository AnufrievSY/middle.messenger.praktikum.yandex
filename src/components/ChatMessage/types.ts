import { BlockProps } from "../../core/Block";

export type ChatMessageProps = BlockProps & {
    author: string;
    text: string;
    time: string;
    isMine?: boolean;
};
