import Block from "../../core/Block";
import { validateField, validateForm, showFieldError } from "../../utils/validation";
import { FormProps } from "./types";

export default class Form extends Block<FormProps> {
    constructor(props: FormProps) {
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
        if (!target || target.tagName !== "INPUT") {
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
        const data: Record<string, string> = {};
        const inputs = Array.from(form.querySelectorAll<HTMLInputElement>("input"));
        inputs.forEach((input) => {
            data[input.name] = input.value;
        });
        console.log("Form data", data);
        this.props.onSubmit?.(data);
    }

    render(): HTMLElement {
        const fieldsMarkup = this.props.fields.map((field) => field.getContent().outerHTML).join("");
        const template = `
            <form class="form">
                <h1 class="form__title">{{title}}</h1>
                <div class="form__fields">
                    {{fields}}
                </div>
                <div class="form__actions">
                    {{{submitButton}}}
                </div>
                <div class="form__footer">{{footer}}</div>
            </form>
        `;
        return this.compile(template, {
            title: this.props.title,
            fields: fieldsMarkup,
            submitButton: this.props.submitButton,
            footer: this.props.footer ?? "",
        });
    }
}
