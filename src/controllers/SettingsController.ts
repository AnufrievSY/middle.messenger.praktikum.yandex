import mediator from '../mediator/AppMediator';
import AuthService, { User } from '../services/authService';
import SettingsService, { PasswordData, SettingsData } from '../services/settingsService';
import { APP_EVENTS } from '../events';

export default class SettingsController {
  constructor(
    private service: SettingsService,
    private authService: AuthService,
  ) {
    mediator.on(APP_EVENTS.settingsUpdate, this.handleUpdate.bind(this));
    mediator.on(APP_EVENTS.settingsPassword, this.handlePasswordUpdate.bind(this));
    mediator.on(APP_EVENTS.settingsAvatar, this.handleAvatarUpdate.bind(this));
  }

  private syncUser(user: User): void {
    this.authService.setCurrentUser(user);
    mediator.emit(APP_EVENTS.authUser, user);
  }

  private async handleUpdate(data: SettingsData): Promise<void> {
    try {
      const user = await this.service.updateProfile(data);
      this.syncUser(user);
    } catch (error) {
      mediator.emit(APP_EVENTS.uiError, 'Не удалось обновить профиль');
      console.error('Failed to update profile', error);
    }
  }

  private async handlePasswordUpdate(data: PasswordData): Promise<void> {
    try {
      await this.service.updatePassword(data);
    } catch (error) {
      mediator.emit(APP_EVENTS.uiError, 'Не удалось обновить пароль');
      console.error('Failed to update password', error);
    }
  }

  private async handleAvatarUpdate(file: File): Promise<void> {
    try {
      const user = await this.service.updateAvatar(file);
      this.syncUser(user);
    } catch (error) {
      mediator.emit(APP_EVENTS.uiError, 'Не удалось обновить аватар');
      console.error('Failed to update avatar', error);
    }
  }
}
