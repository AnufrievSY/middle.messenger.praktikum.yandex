import Block from "../../core/Block";
import { ChatMessageProps } from "./types";

export default class ChatMessage extends Block<ChatMessageProps> {
    render(): HTMLElement {
        const template = `
            <div class="chat-message chat-message--{{owner}}">
                <div class="chat-message__author">{{author}}</div>
                <div class="chat-message__text">{{text}}</div>
                <div class="chat-message__time">{{time}}</div>
            </div>
        `;
        return this.compile(template, {
            author: this.props.author,
            text: this.props.text,
            time: this.props.time,
            owner: this.props.isMine ? "mine" : "their",
        });
    }
}
