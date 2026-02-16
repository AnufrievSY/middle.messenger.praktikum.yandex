import mediator from '../mediator/AppMediator';
import AuthService, { AuthData, RegisterData, User } from '../services/authService';

export default class AuthController {
  constructor(private service: AuthService) {
    mediator.on('auth:login', this.handleLogin.bind(this));
    mediator.on('auth:register', this.handleRegister.bind(this));
    mediator.on('auth:logout', this.handleLogout.bind(this));
  }

  async fetchUser(): Promise<User | null> {
    const user = await this.service.fetchUser();
    mediator.emit('auth:user', user);
    return user;
  }

  private async handleLogin(data: AuthData): Promise<void> {
    try {
      await this.service.login(data);
      await this.fetchUser();
      mediator.emit('route:go', '/messenger');
    } catch (error) {
      console.error('Login failed', error);
    }
  }

  private async handleRegister(data: RegisterData): Promise<void> {
    try {
      await this.service.register(data);
      await this.fetchUser();
      mediator.emit('route:go', '/messenger');
    } catch (error) {
      console.error('Register failed', error);
    }
  }

  private async handleLogout(): Promise<void> {
    try {
      await this.service.logout();
      mediator.emit('auth:user', null);
      mediator.emit('route:go', '/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  }
}
