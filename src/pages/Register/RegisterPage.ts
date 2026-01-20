import BasePage from "../BasePage";
import Form from "../../components/Form";
import Input from "../../components/Input";
import Button from "../../components/Button";
import mediator from "../../mediator/AppMediator";

export default class RegisterPage extends BasePage {
    constructor() {
        const form = new Form({
            title: "Регистрация",
            fields: [
                new Input({ name: "email", label: "Email", type: "email" }),
                new Input({ name: "phone", label: "Телефон", type: "tel" }),
                new Input({ name: "first_name", label: "Имя" }),
                new Input({ name: "second_name", label: "Фамилия" }),
                new Input({ name: "login", label: "Логин" }),
                new Input({ name: "password", label: "Пароль", type: "password" }),
            ],
            submitButton: new Button({ label: "Создать аккаунт", type: "submit" }),
            altLink: { href: "#/login", text: "Уже зарегистрированы?" },
            onSubmit: (data) => mediator.emit("auth:register", data),
        });
        super({ form });
    }

    render(): HTMLElement {
        const template = `
            <section class="input-page">
                <div class="input-card">
                    {{{form}}}
                </div>
            </section>
            <div class="page-bg"></div>
        `;
        return this.compile(template, this.props);
    }
}
