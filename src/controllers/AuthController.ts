import mediator from "../mediator/AppMediator";
import AuthService, { AuthData, RegisterData } from "../services/authService";

export default class AuthController {
    private service: AuthService;

    constructor(service: AuthService) {
        this.service = service;
        mediator.on("auth:login", this.handleLogin.bind(this));
        mediator.on("auth:register", this.handleRegister.bind(this));
    }

    private handleLogin(data: AuthData): void {
        this.service.login(data);
        if (this.service.getCurrentUser()) {
            mediator.emit("route:go", "/chats");
        }
    }

    private handleRegister(data: RegisterData): void {
        this.service.register(data);
        mediator.emit("route:go", "/chats");
    }
}
