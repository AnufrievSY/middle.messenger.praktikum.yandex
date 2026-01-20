import BasePage from "../BasePage";

type ErrorPageProps = {
    code: number;
    message: string;
};

export default class ErrorPage extends BasePage<ErrorPageProps> {
    render(): HTMLElement {
        const template = `
            <section class="page page--center">
                <div class="error">
                    <h1 class="error__code">{{code}}</h1>
                    <p class="error__message">{{message}}</p>
                    <a class="nav-link" href="#/chats">Вернуться к чатам</a>
                </div>
            </section>
        `;
        return this.compile(template, this.props);
    }
}
