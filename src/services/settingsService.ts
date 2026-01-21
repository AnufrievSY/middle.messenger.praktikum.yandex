export type SettingsData = {
  email: string;
  phone: string;
  login: string;
  first_name: string;
  second_name: string;
  password: string;
};

export default class SettingsService {
  updateProfile(data: SettingsData): void {
    console.log('SettingsService.updateProfile', data);
  }
}
