import Block from "../../core/Block";
import { ChatMessageProps } from "./types";

export default class ChatMessage extends Block<ChatMessageProps> {
    render(): HTMLElement {
        const template = `
            <div class="message message--{{owner}}">
                <div class="message__text">{{text}}</div>
                <div class="message__time">{{time}}</div>
            </div>
        `;
        return this.compile(template, {
            text: this.props.text,
            time: this.props.time,
            owner: this.props.isMine ? "mine" : "their",
        });
    }
}
