import Block from '../../core/Block';
import { validateField, validateForm, showFieldError } from '../../utils/validation';
import { FormProps, FormValue } from './types';

export default class Form extends Block<FormProps> {
  constructor(props: FormProps) {
    super({
      ...props,
      events: {
        submit: (event) => this.handleSubmit(event),
        focusout: (event) => this.handleBlur(event),
      },
    });
  }

  private handleBlur(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (!target || target.tagName !== 'INPUT' || target.type === 'file') {
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
    const data: Record<string, FormValue> = {};
    const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('input'));
    inputs.forEach((input) => {
      if (input.type === 'file') {
        const file = input.files?.[0];
        if (file) {
          data[input.name] = file;
        }
      } else {
        data[input.name] = input.value;
      }
    });
    this.props.onSubmit?.(data);
  }

  render(): HTMLElement {
    const fieldsMarkup = this.props.fields.map((field) => field.getContent().outerHTML).join('');
    const subtitleMarkup = this.props.subtitle ? `<p class="input-subtitle">${this.props.subtitle}</p>` : '';
    const altLinkMarkup = this.props.altLink
      ? `<a class="btn alt-btn" href="${this.props.altLink.href}">${this.props.altLink.text}</a>`
      : '';
    const template = `
            <form class="input-form">
                <h1 class="input-title">{{title}}</h1>
                {{subtitle}}
                {{fields}}
                {{{submitButton}}}
                {{altLink}}
            </form>
        `;
    return this.compile(template, {
      title: this.props.title,
      fields: fieldsMarkup,
      submitButton: this.props.submitButton,
      subtitle: subtitleMarkup,
      altLink: altLinkMarkup,
    });
  }
}
