import BasePage from "../BasePage";
import Form from "../../components/Form";
import Input from "../../components/Input";
import Button from "../../components/Button";
import mediator from "../../mediator/AppMediator";

export default class SettingsPage extends BasePage {
    constructor() {
        const form = new Form({
            title: "Профиль",
            fields: [
                new Input({ name: "email", label: "Email", type: "email", value: "user@example.com" }),
                new Input({ name: "phone", label: "Телефон", type: "tel", value: "+79999999999" }),
                new Input({ name: "login", label: "Логин", value: "yandex_user" }),
                new Input({ name: "first_name", label: "Имя", value: "Иван" }),
                new Input({ name: "second_name", label: "Фамилия", value: "Петров" }),
                new Input({ name: "password", label: "Пароль", type: "password" }),
            ],
            submitButton: new Button({ label: "Сохранить", type: "submit" }),
            footer: '<a class="nav-link" href="#/chats">Назад к чатам</a>',
            onSubmit: (data) => mediator.emit("settings:update", data),
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
