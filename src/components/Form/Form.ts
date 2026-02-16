import Block from '../../core/Block';
import { validateField, showFieldError } from '../../utils/validation';
import { collectFormValues, validateHtmlForm } from './formUtils';
import { FormProps } from './types';

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
    if (!validateHtmlForm(form)) {
      return;
    }

    this.props.onSubmit?.(collectFormValues(form));
  }

  render(): HTMLElement {
    const fieldsMarkup = this.props.fields.map((field) => field.getContent().outerHTML).join('');
    const subtitleMarkup = this.props.subtitle ? `<p class="input-subtitle">${this.props.subtitle}</p>` : '';
    const altLinkMarkup = this.props.altLink
      ? `<a class="btn alt-btn" href="${this.props.altLink.href}">${this.props.altLink.text}</a>`
      : '';
    const titleMarkup = this.props.title ? `<h1 class="input-title">${this.props.title}</h1>` : '';

    const template = `
            <form class="input-form">
                ${titleMarkup}
                {{subtitle}}
                {{fields}}
                {{submitButton}}
                {{altLink}}
            </form>
        `;

    return this.compile(template, {
      fields: fieldsMarkup,
      submitButton: this.props.submitButton ? this.props.submitButton.getContent().outerHTML : '',
      subtitle: subtitleMarkup,
      altLink: altLinkMarkup,
    });
  }
}
