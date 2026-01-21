import EventBus from './EventBus';
import templator, { TemplateContext } from './templator';

export type EventHandlers = Record<string, (event: Event) => void>;

export type BlockProps = Record<string, unknown> & {
  events?: Record<string, EventListener>;
};

export default class Block<P extends BlockProps = BlockProps> {
  static EVENTS = {
    INIT: 'init',
    FLOW_CDM: 'flow:component-did-mount',
    FLOW_CDU: 'flow:component-did-update',
    FLOW_RENDER: 'flow:render',
  };

  private _element: HTMLElement | null = null;

  private _id: string = Math.random().toString(36).substring(2, 15);

  protected props: P;

  protected children: Record<string, Block>;

  protected eventBus: EventBus;

  constructor(propsWithChildren: P = {} as P) {
    const { props, children } = this.getChildren(propsWithChildren);
    this.props = this.makePropsProxy(props);
    this.children = children;
    this.eventBus = new EventBus();
    this.registerEvents();
    this.eventBus.emit(Block.EVENTS.INIT);
  }

  private registerEvents(): void {
    this.eventBus.on(Block.EVENTS.INIT, this.init.bind(this));

    this.eventBus.on(Block.EVENTS.FLOW_RENDER, () => {
      this._render();
    });
  }

  private getChildren(propsAndChildren: P): { props: P; children: Record<string, Block> } {
    const props = {} as P;
    const children: Record<string, Block> = {};

    Object.entries(propsAndChildren).forEach(([key, value]) => {
      if (value instanceof Block) {
        children[key] = value;
      } else {
        props[key as keyof P] = value as P[keyof P];
      }
    });

    return { props, children };
  }

  private makePropsProxy(props: P): P {
    return new Proxy(props, {
      set: (target, prop: string, value) => {
        const oldValue = { ...target } as P;
        // eslint-disable-next-line no-param-reassign
        target[prop as keyof P] = value as P[keyof P];
        this.eventBus.emit(Block.EVENTS.FLOW_CDU, oldValue, target);
        this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
        return true;
      },
    });
  }

  init(): void {
    this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
  }

  componentDidMount(): void {
    this.eventBus.emit(Block.EVENTS.FLOW_CDM);
  }

  setProps(nextProps: Partial<P>): void {
    if (!nextProps) {
      return;
    }
    Object.assign(this.props, nextProps);
  }

  getContent(): HTMLElement {
    if (!this._element) {
      throw new Error('Component is not rendered');
    }
    return this._element;
  }

  compile(template: string, context: TemplateContext): HTMLElement {
    const contextWithChildren: TemplateContext = { ...context };

    Object.entries(this.children).forEach(([key, child]) => {
      contextWithChildren[key] = `<div data-id="${child._id}"></div>`;
    });

    const html = templator(template, contextWithChildren);
    const temp = document.createElement('template');
    temp.innerHTML = html.trim();
    const element = temp.content.firstElementChild as HTMLElement;

    Object.values(this.children).forEach((child) => {
      const stub = element.querySelector(`[data-id="${child._id}"]`);
      if (!stub) {
        return;
      }
      stub.replaceWith(child.getContent());
    });

    return element;
  }

  private _render(): void {
    const newElement = this.render();
    if (!newElement) {
      return;
    }
    if (this._element) {
      this._element.replaceWith(newElement);
    }
    this._element = newElement;
    this.addEvents();
  }

  private addEvents(): void {
    const { events } = this.props;
    if (!events || !this._element) {
      return;
    }
    Object.entries(events).forEach(([event, listener]) => {
      this._element?.addEventListener(event, listener);
    });
  }

  render(): HTMLElement {
    const template = '<div></div>';
    return this.compile(template, this.props);
  }
}
