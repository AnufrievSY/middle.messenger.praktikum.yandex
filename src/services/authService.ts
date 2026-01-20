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

export default class AuthService {
    login(data: AuthData): void {
        console.log("AuthService.login", data);
    }

    register(data: RegisterData): void {
        console.log("AuthService.register", data);
    }
}
