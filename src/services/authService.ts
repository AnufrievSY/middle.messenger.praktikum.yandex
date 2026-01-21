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

type AuthResult = {
  ok: boolean;
  reason?: 'exists' | 'invalid';
};

export default class AuthService {
  private currentUser: RegisterData | null = null;

  private readonly demoUser: RegisterData = {
    email: 'demo@example.com',
    phone: '+79990001122',
    login: 'demo',
    first_name: 'Demo',
    second_name: 'User',
    password: 'Demo1234',
  };

  private users: RegisterData[] = [this.demoUser];

  getCurrentUser(): RegisterData | null {
    return this.currentUser;
  }

  getUsers(): RegisterData[] {
    return [...this.users];
  }

  login(data: AuthData): AuthResult {
    const user = this.users.find(
      (item) => item.login === data.login && item.password === data.password,
    );
    if (user) {
      this.currentUser = user;
      return { ok: true };
    }
    console.log('AuthService.login', data);
    return { ok: false, reason: 'invalid' };
  }

  register(data: RegisterData): AuthResult {
    const exists = this.users.some(
      (item) => item.login === data.login || item.email === data.email,
    );
    if (exists) {
      this.currentUser = this.demoUser;
      console.log('AuthService.register.exists', data);
      return { ok: true, reason: 'exists' };
    }
    this.users.push(data);
    this.currentUser = data;
    console.log('AuthService.register', data);
    return { ok: true };
  }
}
