import Block from '../../core/Block';
import { validateField, validateForm, showFieldError } from '../../utils/validation';
import { MessageFormProps } from './types';

export default class MessageForm extends Block<MessageFormProps> {
  constructor(props: MessageFormProps) {
    super({
      ...props,
      events: {
        submit: (event) => this.handleSubmit(event),
        blur: (event) => this.handleBlur(event),
      },
    });
  }

  private handleBlur(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (!target || target.tagName !== 'INPUT') {
      return;
    }
    const result = validateField(target.name, target.value);
    showFieldError(target, result);
  }

  private handleSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const isValid = validateForm(form);
    if (!isValid) {
      return;
    }
    const input = form.querySelector<HTMLInputElement>("input[name='message']");
    if (!input) {
      return;
    }
    const message = input.value;
    console.log('Form data', { message });
    this.props.onSubmit?.(message);
    input.value = '';
  }

  render(): HTMLElement {
    const template = `
            <form class="chat__input">
                <div class="field">
                    <input class="field__input chat__input_message" name="message" type="text" placeholder="Введите сообщение" />
                    <span class="field__error"></span>
                </div>
                <button class="chat__input_send_message" type="submit"></button>
            </form>
        `;
    return this.compile(template, {});
  }
}
