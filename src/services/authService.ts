import HTTPTransport from './httpTransport';

export type AuthData = {
  login: string;
  password: string;
};

export type RegisterData = {
  email: string;
  phone: string;
  login: string;
  first_name: string;
  second_name: string;
  password: string;
};

export type User = Omit<RegisterData, 'password'> & {
  id: number;
  avatar: string | null;
  display_name: string | null;
};

export default class AuthService {
  private transport = new HTTPTransport('https://ya-praktikum.tech/api/v2');

  private currentUser: User | null = null;

  async login(data: AuthData): Promise<void> {
    await this.transport.post('/auth/signin', { data });
  }

  async register(data: RegisterData): Promise<void> {
    await this.transport.post('/auth/signup', { data });
  }

  async logout(): Promise<void> {
    await this.transport.post('/auth/logout');
    this.currentUser = null;
  }

  async fetchUser(): Promise<User | null> {
    try {
      const user = await this.transport.get('/auth/user') as User;
      this.currentUser = user;
      return user;
    } catch (error) {
      this.currentUser = null;
      return null;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}
