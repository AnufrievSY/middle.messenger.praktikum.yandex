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
    private currentUser: RegisterData | null = null;

    private readonly demoUser: RegisterData = {
        email: "demo@example.com",
        phone: "+79990001122",
        login: "demo",
        first_name: "Demo",
        second_name: "User",
        password: "Demo1234",
    };

    getCurrentUser(): RegisterData | null {
        return this.currentUser;
    }

    login(data: AuthData): void {
        const isDemoMatch = data.login === this.demoUser.login && data.password === this.demoUser.password;
        if (isDemoMatch) {
            this.currentUser = this.demoUser;
        }
        console.log("AuthService.login", data);
    }

    register(data: RegisterData): void {
        this.currentUser = data;
        console.log("AuthService.register", data);
    }
}
