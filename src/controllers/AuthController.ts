import mediator from '../mediator/AppMediator';
import AuthService, { AuthData, RegisterData, User } from '../services/authService';
import { APP_EVENTS } from '../events';

export default class AuthController {
  constructor(private service: AuthService) {
    mediator.on(APP_EVENTS.authLogin, this.handleLogin.bind(this));
    mediator.on(APP_EVENTS.authRegister, this.handleRegister.bind(this));
    mediator.on(APP_EVENTS.authLogout, this.handleLogout.bind(this));
  }

  async fetchUser(): Promise<User | null> {
    const user = await this.service.fetchUser();
    mediator.emit(APP_EVENTS.authUser, user);
    return user;
  }

  private async handleLogin(data: AuthData): Promise<void> {
    try {
      await this.service.login(data);
      await this.fetchUser();
      mediator.emit(APP_EVENTS.routeGo, '/messenger');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неверный логин или пароль';
      mediator.emit(APP_EVENTS.authLoginFailed, message);
      mediator.emit(APP_EVENTS.uiError, message);
      console.error('Login failed', error);
    }
  }

  private async handleRegister(data: RegisterData): Promise<void> {
    try {
      const isLoginAvailable = await this.service.isLoginAvailable(data.login);
      if (!isLoginAvailable) {
        const message = 'Логин уже занят';
        mediator.emit(APP_EVENTS.uiError, message);
        console.error('Register failed: login already exists');
        return;
      }

      await this.service.register(data);
      await this.fetchUser();
      mediator.emit(APP_EVENTS.routeGo, '/messenger');
    } catch (error) {
      mediator.emit(APP_EVENTS.uiError, 'Не удалось зарегистрироваться');
      console.error('Register failed', error);
    }
  }

  private async handleLogout(): Promise<void> {
    try {
      await this.service.logout();
      mediator.emit(APP_EVENTS.authUser, null);
      mediator.emit(APP_EVENTS.routeGo, '/');
    } catch (error) {
      mediator.emit(APP_EVENTS.uiError, 'Не удалось выйти из профиля');
      console.error('Logout failed', error);
    }
  }
}
