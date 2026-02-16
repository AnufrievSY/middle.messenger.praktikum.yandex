import Block from '../../core/Block';
import { InputProps } from './types';

export default class Input extends Block<InputProps> {
  render(): HTMLElement {
    const template = `
            <div class="field">
                <label class="field__label" for="{{name}}">{{label}}</label>
                <input class="field__input" id="{{name}}" name="{{name}}" type="{{type}}" value="{{value}}" placeholder="{{placeholder}}" />
                <span class="field__error"></span>
            </div>
        `;
    return this.compile(template, {
      name: this.props.name,
      label: this.props.label,
      type: this.props.type ?? 'text',
      value: this.props.value ?? '',
      placeholder: this.props.placeholder ?? '',
    });
  }
}
