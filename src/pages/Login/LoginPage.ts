import BasePage from "../BasePage";
import Form from "../../components/Form";
import Input from "../../components/Input";
import Button from "../../components/Button";
import mediator from "../../mediator/AppMediator";

export default class LoginPage extends BasePage {
    constructor() {
        const form = new Form({
            title: "Вход",
            fields: [
                new Input({ name: "login", label: "Логин" }),
                new Input({ name: "password", label: "Пароль", type: "password" }),
            ],
            submitButton: new Button({ label: "Войти", type: "submit" }),
            footer: '<a class="nav-link" href="#/register">Нет аккаунта?</a>',
            onSubmit: (data) => mediator.emit("auth:login", data),
        });
        super({ form });
    }

    render(): HTMLElement {
        const template = `
            <section class="page page--center">
                {{{form}}}
            </section>
        `;
        return this.compile(template, this.props);
    }
}
