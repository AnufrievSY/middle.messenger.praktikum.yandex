import './styles/base.scss';
import './styles/input-form.scss';
import './styles/error-page.scss';
import './styles/chats.scss';

import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { SettingsPage } from './pages/Settings';
import { ChatsPage } from './pages/Chats';
import { ErrorPage } from './pages/Error';
import mediator from './mediator/AppMediator';

import ChatController from './controllers/ChatController';
import AuthController from './controllers/AuthController';
import SettingsController from './controllers/SettingsController';
import ChatService from './services/chatService';
import AuthService from './services/authService';
import SettingsService from './services/settingsService';
import Router from './core/Router';
import { APP_EVENTS } from './events';

const chatService = new ChatService();
const authService = new AuthService();
const settingsService = new SettingsService();

const authController = new AuthController(authService);
// eslint-disable-next-line no-new
new ChatController(chatService, authService);
// eslint-disable-next-line no-new
new SettingsController(settingsService, authService);

(window as unknown as { app?: { auth: AuthService } }).app = { auth: authService };

const router = new Router({
  rootQuery: '#app',
  checkAuth: async () => {
    const user = authService.getCurrentUser();
    if (user) {
      return true;
    }
    const fetchedUser = await authController.fetchUser();
    return Boolean(fetchedUser);
  },
  onUnauthorizedRedirect: '/',
  onAuthorizedRedirect: '/messenger',
});

router
  .use({ path: '/', shouldBeGuest: true, render: () => new LoginPage() })
  .use({ path: '/sign-up', shouldBeGuest: true, render: () => new RegisterPage() })
  .use({ path: '/settings', shouldAuth: true, render: () => new SettingsPage() })
  .use({ path: '/messenger', shouldAuth: true, render: () => new ChatsPage() })
  .use({ path: '/404', render: () => new ErrorPage({ code: 404, message: 'Страница не найдена' }) })
  .use({ path: '/500', render: () => new ErrorPage({ code: 500, message: 'Мы уже исправляем' }) });

router.start();

mediator.on(APP_EVENTS.routeGo, (path: string) => {
  router.go(path);
});

mediator.on(APP_EVENTS.routeBack, () => {
  router.back();
});

mediator.on(APP_EVENTS.routeForward, () => {
  router.forward();
});

mediator.on(APP_EVENTS.uiError, (message: string) => {
  console.error(message);
});
