export type Listener<Args extends unknown[] = unknown[]> = (...args: Args) => void | Promise<void>;

export default class EventBus<
    Events extends Record<string, unknown[]> = Record<string, unknown[]>,
> {
  private listeners: { [K in keyof Events]?: Set<Listener<Events[K]>> } = {};

  on<K extends keyof Events>(event: K, callback: Listener<Events[K]>): void {
    const set = this.listeners[event] ?? new Set();
    set.add(callback);
    this.listeners[event] = set;
  }

  off<K extends keyof Events>(event: K, callback: Listener<Events[K]>): void {
    this.listeners[event]?.delete(callback);
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K]): void {
    this.listeners[event]?.forEach((listener) => listener(...args));
  }
}
