import Block from '../../core/Block';
import { ButtonProps } from './types';

export default class Button extends Block<ButtonProps> {
  render(): HTMLElement {
    const template = `
            <button class="btn {{variantClass}}" type="{{type}}">
                {{label}}
            </button>
        `;
    return this.compile(template, {
      variantClass: this.props.variant === 'secondary' ? 'alt-btn' : 'submit-btn',
      type: this.props.type ?? 'button',
      label: this.props.label,
    });
  }
}
