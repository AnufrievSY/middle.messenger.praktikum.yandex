import Block from '../../core/Block';
import { ChatMessageProps } from './types';

export default class ChatMessage extends Block<ChatMessageProps> {
  private renderStatus(): string {
    if (!this.props.isMine || !this.props.status) {
      return '';
    }

    if (this.props.status === 'sending') {
      return '<span class="message__status" title="Отправляется">🕒</span>';
    }

    if (this.props.status === 'sent') {
      return '<span class="message__status" title="Отправлено">✓</span>';
    }

    return '<span class="message__status message__status--read" title="Прочитано">✓✓</span>';
  }

  render(): HTMLElement {
    const template = `
            <div class="message message--{{owner}}">
                <div class="message__text">{{text}}</div>
                <div class="message__meta">
                    <div class="message__time">{{time}}</div>
                    {{statusMarkup}}
                </div>
            </div>
        `;

    return this.compile(template, {
      text: this.props.text,
      time: this.props.time,
      owner: this.props.isMine ? 'mine' : 'their',
      statusMarkup: this.renderStatus(),
    });
  }
}
