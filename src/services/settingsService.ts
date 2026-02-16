import HTTPTransport from './httpTransport';
import { API_BASE_URL } from '../config/api';
import { User } from './authService';

export type SettingsData = {
  email: string;
  phone: string;
  login: string;
  first_name: string;
  second_name: string;
  display_name?: string;
};

export type PasswordData = {
  oldPassword: string;
  newPassword: string;
};

export default class SettingsService {
  private transport = new HTTPTransport(API_BASE_URL);

  async updateProfile(data: SettingsData): Promise<User> {
    return this.transport.put('/user/profile', { data }) as Promise<User>;
  }

  async updatePassword(data: PasswordData): Promise<void> {
    await this.transport.put('/user/password', { data });
  }

  async updateAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.transport.put('/user/profile/avatar', { data: formData }) as Promise<User>;
  }
}
