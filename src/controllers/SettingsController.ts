import mediator from '../mediator/AppMediator';
import SettingsService, { PasswordData, SettingsData } from '../services/settingsService';

export default class SettingsController {
  constructor(private service: SettingsService) {
    mediator.on('settings:update', this.handleUpdate.bind(this));
    mediator.on('settings:password', this.handlePasswordUpdate.bind(this));
    mediator.on('settings:avatar', this.handleAvatarUpdate.bind(this));
  }

  private async handleUpdate(data: SettingsData): Promise<void> {
    try {
      await this.service.updateProfile(data);
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
      await this.service.updateAvatar(file);
    } catch (error) {
      console.error('Failed to update avatar', error);
    }
  }
}
