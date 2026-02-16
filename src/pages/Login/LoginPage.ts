import BasePage from '../BasePage';
import { Form } from '../../components/Form';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import mediator from '../../mediator/AppMediator';
import { APP_EVENTS } from '../../events';

export default class LoginPage extends BasePage {
  constructor() {
    const form = new Form({
      title: 'Вход',
      fields: [
        new Input({ name: 'login', label: 'Логин' }),
        new Input({ name: 'password', label: 'Пароль', type: 'password' }),
      ],
      submitButton: new Button({ label: 'Войти', type: 'submit' }),
      altLink: { href: '/sign-up', text: 'Нет аккаунта?' },
      onSubmit: (data) => mediator.emit(APP_EVENTS.authLogin, {
        login: String(data.login ?? ''),
        password: String(data.password ?? ''),
      }),
    });
    super({ form, loginError: '' });

    mediator.on(APP_EVENTS.authLoginFailed, (message: string) => {
      this.setProps({ loginError: message });
    });
  }

  render(): HTMLElement {
    const template = `
            <section class="input-page">
                <div class="input-card">
                    {{loginError}}
                    {{{form}}}
                </div>
            </section>
            <div class="page-bg"></div>
        `;

    const element = this.compile(template, {
      ...this.props,
      loginError: this.props.loginError
        ? '<div class="login-error">Пользователь не найден. <a href="/sign-up" class="login-error__register">Зарегистрируйтесь</a></div>'
        : '',
    });

    const registerLink = element.querySelector<HTMLAnchorElement>('.alt-btn');
    if (registerLink && this.props.loginError) {
      registerLink.classList.add('alt-btn--highlight');
    }

    return element;
  }
}
