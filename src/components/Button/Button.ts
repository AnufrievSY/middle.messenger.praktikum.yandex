import Block from "../../core/Block";
import { ButtonProps } from "./types";

export default class Button extends Block<ButtonProps> {
    render(): HTMLElement {
        const template = `
            <button class="button button--{{variant}}" type="{{type}}">
                {{label}}
            </button>
        `;
        return this.compile(template, {
            variant: this.props.variant ?? "primary",
            type: this.props.type ?? "button",
            label: this.props.label,
        });
    }
}
