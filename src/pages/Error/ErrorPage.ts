import BasePage from "../BasePage";

type ErrorPageProps = {
    code: number;
    message: string;
};

export default class ErrorPage extends BasePage<ErrorPageProps> {
    render(): HTMLElement {
        const imageSrc = `/images/errors/${this.props.code}.jpg`;
        const template = `
            <section class="error">
                <div class="tile tile--img">
                    <img class="tile__img" src="{{imageSrc}}" alt="Error illustration" />
                </div>
                <div class="tile tile--code">
                    <div class="code">{{code}}</div>
                </div>
                <div class="tile tile--text">
                    <div class="spaced">
                        <div class="spaced__line">{{message}}</div>
                    </div>
                </div>
                <div class="tile tile--back">
                    <a class="back" href="#/chats">go back</a>
                </div>
            </section>
            <div class="page-bg"></div>
        `;
        return this.compile(template, { ...this.props, imageSrc });
    }
}
