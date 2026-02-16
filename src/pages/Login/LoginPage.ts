import BasePage from '../BasePage';
import { Form } from '../../components/Form';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import mediator from '../../mediator/AppMediator';

export default class LoginPage extends BasePage {
  constructor() {
    const form = new Form({
      title: 'Вход',
      fields: [
        new Input({ name: 'login', label: 'Логин' }),
        new Input({ name: 'password', label: 'Пароль', type: 'password' }),
      ],
      submitButton: new Button({ label: 'Войти', type: 'submit' }),
      altLink: { href: '#/register', text: 'Нет аккаунта?' },
      onSubmit: (data) => mediator.emit('auth:login', {
        login: data.login ?? '',
        password: data.password ?? '',
      }),
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
