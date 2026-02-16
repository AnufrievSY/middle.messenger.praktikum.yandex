import mediator from '../mediator/AppMediator';
import AuthService, { User } from '../services/authService';
import SettingsService, { PasswordData, SettingsData } from '../services/settingsService';

export default class SettingsController {
  constructor(
    private service: SettingsService,
    private authService: AuthService,
  ) {
    mediator.on('settings:update', this.handleUpdate.bind(this));
    mediator.on('settings:password', this.handlePasswordUpdate.bind(this));
    mediator.on('settings:avatar', this.handleAvatarUpdate.bind(this));
  }

  private syncUser(user: User): void {
    this.authService.setCurrentUser(user);
    mediator.emit('auth:user', user);
  }

  private async handleUpdate(data: SettingsData): Promise<void> {
    try {
      const user = await this.service.updateProfile(data);
      this.syncUser(user);
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  }

  private async handlePasswordUpdate(data: PasswordData): Promise<void> {
    try {
      await this.service.updatePassword(data);
    } catch (error) {
      console.error('Failed to update password', error);
    }
  }

  private async handleAvatarUpdate(file: File): Promise<void> {
    try {
      const user = await this.service.updateAvatar(file);
      this.syncUser(user);
    } catch (error) {
      console.error('Failed to update avatar', error);
    }
  }
}
