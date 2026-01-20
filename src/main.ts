import "./styles/base.scss";
import "./styles/layout.scss";
import "./components/Button/Button.scss";
import "./components/Input/Input.scss";
import "./components/Form/Form.scss";
import "./components/ChatList/ChatList.scss";
import "./components/ChatMessage/ChatMessage.scss";
import "./components/NavLink/NavLink.scss";
import "./components/MessageForm/MessageForm.scss";

import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import SettingsPage from "./pages/Settings";
import ChatsPage from "./pages/Chats";
import ErrorPage from "./pages/Error";
import mediator from "./mediator/AppMediator";

import ChatController from "./controllers/ChatController";
import AuthController from "./controllers/AuthController";
import SettingsController from "./controllers/SettingsController";
import ChatService from "./services/chatService";
import AuthService from "./services/authService";
import SettingsService from "./services/settingsService";

new ChatController(new ChatService());
new AuthController(new AuthService());
new SettingsController(new SettingsService());

const routes: Record<string, () => HTMLElement> = {
    "/login": () => new LoginPage().getContent(),
    "/register": () => new RegisterPage().getContent(),
    "/settings": () => new SettingsPage().getContent(),
    "/chats": () => new ChatsPage().getContent(),
    "/404": () => new ErrorPage({ code: 404, message: "Страница не найдена" }).getContent(),
    "/500": () => new ErrorPage({ code: 500, message: "Мы уже исправляем" }).getContent(),
};

function renderPage(): void {
    const root = document.querySelector<HTMLElement>("#app");
    if (!root) {
        throw new Error("Root element not found");
    }
    const path = location.hash.replace("#", "") || "/login";
    const page = routes[path] ? routes[path]() : routes["/404"]();
    root.innerHTML = "";
    root.append(page);
}

window.addEventListener("hashchange", renderPage);
window.addEventListener("DOMContentLoaded", renderPage);

mediator.on("route:go", (path: string) => {
    window.location.hash = path;
});
