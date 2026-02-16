import BasePage from '../BasePage';
import { Form } from '../../components/Form';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import mediator from '../../mediator/AppMediator';

export default class SettingsPage extends BasePage {
  constructor() {
    const profileForm = new Form({
      title: 'Данные профиля',
      fields: [
        new Input({ name: 'email', label: 'Email', type: 'email' }),
        new Input({ name: 'phone', label: 'Телефон', type: 'tel' }),
        new Input({ name: 'login', label: 'Логин' }),
        new Input({ name: 'first_name', label: 'Имя' }),
        new Input({ name: 'second_name', label: 'Фамилия' }),
      ],
      submitButton: new Button({ label: 'Сохранить данные', type: 'submit' }),
      onSubmit: (data) => mediator.emit('settings:update', {
        email: String(data.email ?? ''),
        phone: String(data.phone ?? ''),
        login: String(data.login ?? ''),
        first_name: String(data.first_name ?? ''),
        second_name: String(data.second_name ?? ''),
      }),
    });

    const passwordForm = new Form({
      title: 'Пароль',
      subtitle: 'Изменение пароля',
      fields: [
        new Input({ name: 'old_password', label: 'Старый пароль', type: 'password' }),
        new Input({ name: 'new_password', label: 'Новый пароль', type: 'password' }),
      ],
      submitButton: new Button({ label: 'Обновить пароль', type: 'submit' }),
      onSubmit: (data) => mediator.emit('settings:password', {
        oldPassword: String(data.old_password ?? ''),
        newPassword: String(data.new_password ?? ''),
      }),
    });

    const avatarForm = new Form({
      title: 'Аватар',
      subtitle: 'Загрузка нового аватара',
      fields: [
        new Input({ name: 'avatar', label: 'Файл', type: 'file' }),
      ],
      submitButton: new Button({ label: 'Обновить аватар', type: 'submit' }),
      altLink: { href: '/messenger', text: 'Назад к чатам' },
      onSubmit: (data) => {
        const { avatar } = data;
        if (avatar instanceof File) {
          mediator.emit('settings:avatar', avatar);
        }
      },
    });

    const logoutButton = new Button({
      label: 'Выйти',
      type: 'button',
      events: {
        click: () => mediator.emit('auth:logout'),
      },
    });

    super({
      profileForm,
      passwordForm,
      avatarForm,
      logoutButton,
    });
  }

  render(): HTMLElement {
    const template = `
            <section class="input-page">
                <a class="back-btn" href="/messenger" aria-label="Назад">‹</a>
                <div class="input-card">
                    <div class="avatar-placeholder" aria-hidden="true"></div>
                    {{{profileForm}}}
                    {{{passwordForm}}}
                    {{{avatarForm}}}
                    {{{logoutButton}}}
                </div>
            </section>
            <div class="page-bg"></div>
        `;
    return this.compile(template, this.props);
  }
}
