export type Route = {
  path: string;
  shouldAuth?: boolean;
  shouldBeGuest?: boolean;
  render: () => HTMLElement;
};

type RouterOptions = {
  rootQuery: string;
  onUnauthorizedRedirect?: string;
  onAuthorizedRedirect?: string;
  checkAuth: () => Promise<boolean>;
};

export default class Router {
  private routes = new Map<string, Route>();

  private readonly rootQuery: string;

  private readonly checkAuth: () => Promise<boolean>;

  private readonly onUnauthorizedRedirect: string;

  private readonly onAuthorizedRedirect: string;

  constructor(options: RouterOptions) {
    this.rootQuery = options.rootQuery;
    this.checkAuth = options.checkAuth;
    this.onUnauthorizedRedirect = options.onUnauthorizedRedirect ?? '/';
    this.onAuthorizedRedirect = options.onAuthorizedRedirect ?? '/messenger';
  }

  use(route: Route): Router {
    this.routes.set(route.path, route);
    return this;
  }

  start(): void {
    window.addEventListener('popstate', () => {
      this.renderRoute(window.location.pathname).catch((error) => console.error(error));
    });

    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest('a') as HTMLAnchorElement | null;
      if (!link) {
        return;
      }
      const href = link.getAttribute('href') ?? '';
      if (!href.startsWith('/')) {
        return;
      }
      event.preventDefault();
      this.go(href);
    });

    this.renderRoute(window.location.pathname).catch((error) => console.error(error));
  }

  go(pathname: string): void {
    window.history.pushState({}, '', pathname);
    this.renderRoute(pathname).catch((error) => console.error(error));
  }

  back(): void {
    window.history.back();
  }

  forward(): void {
    window.history.forward();
  }

  private async renderRoute(pathname: string): Promise<void> {
    const route = this.routes.get(pathname) ?? this.routes.get('/404');
    if (!route) {
      return;
    }

    const isAuthorized = await this.checkAuth();

    if (route.shouldAuth && !isAuthorized) {
      if (pathname !== this.onUnauthorizedRedirect) {
        this.go(this.onUnauthorizedRedirect);
      }
      return;
    }

    if (route.shouldBeGuest && isAuthorized) {
      if (pathname !== this.onAuthorizedRedirect) {
        this.go(this.onAuthorizedRedirect);
      }
      return;
    }

    const root = document.querySelector<HTMLElement>(this.rootQuery);
    if (!root) {
      throw new Error('Root element not found');
    }

    root.replaceChildren(route.render());
  }
}
