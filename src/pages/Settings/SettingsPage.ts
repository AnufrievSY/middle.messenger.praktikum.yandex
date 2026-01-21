import BasePage from '../BasePage';
import { Form } from '../../components/Form';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import mediator from '../../mediator/AppMediator';

export default class SettingsPage extends BasePage {
  constructor() {
    const form = new Form({
      title: 'Профиль',
      fields: [
        new Input({
          name: 'email', label: 'Email', type: 'email', value: 'user@example.com',
        }),
        new Input({
          name: 'phone', label: 'Телефон', type: 'tel', value: '+79999999999',
        }),
        new Input({ name: 'login', label: 'Логин', value: 'yandex_user' }),
        new Input({ name: 'first_name', label: 'Имя', value: 'Иван' }),
        new Input({ name: 'second_name', label: 'Фамилия', value: 'Петров' }),
        new Input({ name: 'password', label: 'Пароль', type: 'password' }),
      ],
      submitButton: new Button({ label: 'Сохранить', type: 'submit' }),
      altLink: { href: '#/chats', text: 'Назад к чатам' },
      onSubmit: (data) => mediator.emit('settings:update', {
        email: data.email ?? '',
        phone: data.phone ?? '',
        login: data.login ?? '',
        first_name: data.first_name ?? '',
        second_name: data.second_name ?? '',
        password: data.password ?? '',
      }),
    });
    super({ form });
  }

  render(): HTMLElement {
    const template = `
            <section class="input-page">
                <a class="back-btn" href="#/chats" aria-label="Назад">‹</a>
                <div class="input-card">
                    <div class="avatar-placeholder" aria-hidden="true"></div>
                    {{{form}}}
                </div>
            </section>
            <div class="page-bg"></div>
        `;
    return this.compile(template, this.props);
  }
}
