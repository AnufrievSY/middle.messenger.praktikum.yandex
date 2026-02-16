import BasePage from '../BasePage';
import { Form } from '../../components/Form';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import mediator from '../../mediator/AppMediator';
import AuthService from '../../services/authService';

export default class SettingsPage extends BasePage {
  constructor() {
    const auth = (window as unknown as { app?: { auth?: AuthService } }).app?.auth;
    const user = auth?.getCurrentUser();
    const avatarPreview = user?.avatar
      ? `https://ya-praktikum.tech/api/v2/resources${user.avatar}`
      : '/data/users/1/avatar.jpg';

    const profileForm = new Form({
      fields: [
        new Input({
          name: 'email',
          label: 'Email',
          type: 'email',
          value: user?.email ?? '',
        }),
        new Input({
          name: 'phone',
          label: 'Телефон',
          type: 'tel',
          value: user?.phone ?? '',
        }),
        new Input({ name: 'login', label: 'Логин', value: user?.login ?? '' }),
        new Input({ name: 'first_name', label: 'Имя', value: user?.first_name ?? '' }),
        new Input({ name: 'second_name', label: 'Фамилия', value: user?.second_name ?? '' }),
      ],
      onSubmit: (data) => mediator.emit('settings:update', {
        email: String(data.email ?? ''),
        phone: String(data.phone ?? ''),
        login: String(data.login ?? ''),
        first_name: String(data.first_name ?? ''),
        second_name: String(data.second_name ?? ''),
      }),
    });

    const passwordForm = new Form({
      fields: [
        new Input({ name: 'old_password', label: 'Старый пароль', type: 'password' }),
        new Input({ name: 'new_password', label: 'Новый пароль', type: 'password' }),
      ],
      onSubmit: (data) => mediator.emit('settings:password', {
        oldPassword: String(data.old_password ?? ''),
        newPassword: String(data.new_password ?? ''),
      }),
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
      logoutButton,
      avatarPreview,
    });
  }

  private handleAvatarChange(file: File): void {
    const previewUrl = URL.createObjectURL(file);
    const avatarImage = this.getContent().querySelector<HTMLImageElement>('.settings-avatar-img');
    if (avatarImage) {
      avatarImage.src = previewUrl;
    }
    mediator.emit('settings:avatar', file);
  }

  private markDirty(form: HTMLFormElement, saveButton: HTMLButtonElement): void {
    form.dataset.dirty = 'true';
    saveButton.classList.add('settings-top-save--visible');
  }

  private clearDirty(form: HTMLFormElement, saveButton: HTMLButtonElement): void {
    form.dataset.dirty = 'false';
    saveButton.classList.remove('settings-top-save--visible');
  }

  render(): HTMLElement {
    const template = `
            <section class="input-page">
                <a class="back-btn" href="/messenger" aria-label="Назад">‹</a>
                <button class="settings-top-save" id="settings-top-save" type="button" aria-label="Сохранить">✓</button>
                <div class="input-card">
                    <div class="settings-avatar-block">
                      <button type="button" id="settings-avatar-trigger" class="settings-avatar-btn" aria-label="Изменить аватар">
                        <img class="settings-avatar-img" src="{{avatarPreview}}" alt="Аватар пользователя" />
                      </button>
                      <input id="settings-avatar-input" class="settings-avatar-input" name="avatar" type="file" accept="image/*" />
                    </div>
                    {{{profileForm}}}
                    {{{passwordForm}}}
                    {{{logoutButton}}}
                </div>
            </section>
            <div class="page-bg"></div>
        `;
    return this.compile(template, this.props);
  }

  componentDidMount(): void {
    super.componentDidMount();

    const element = this.getContent();
    const avatarTrigger = element.querySelector<HTMLButtonElement>('#settings-avatar-trigger');
    const avatarInput = element.querySelector<HTMLInputElement>('#settings-avatar-input');
    const saveButton = element.querySelector<HTMLButtonElement>('#settings-top-save');
    const forms = Array.from(element.querySelectorAll<HTMLFormElement>('.input-form'));

    let activeForm: HTMLFormElement | null = null;

    avatarTrigger?.addEventListener('click', () => avatarInput?.click());
    avatarInput?.addEventListener('change', () => {
      const file = avatarInput.files?.[0];
      if (!file) {
        return;
      }
      this.handleAvatarChange(file);
      avatarInput.value = '';
    });

    forms.forEach((form) => {
      form.dataset.dirty = 'false';
      form.addEventListener('focusin', () => {
        activeForm = form;
      });
      form.addEventListener('input', () => {
        activeForm = form;
        if (saveButton) {
          this.markDirty(form, saveButton);
        }
      });
      form.addEventListener('submit', () => {
        if (saveButton) {
          this.clearDirty(form, saveButton);
        }
      });
    });

    saveButton?.addEventListener('click', () => {
      if (activeForm && activeForm.dataset.dirty === 'true') {
        activeForm.requestSubmit();
      }
    });
  }
}
