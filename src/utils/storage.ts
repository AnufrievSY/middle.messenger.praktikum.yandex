export function getStorageJSON<T>(
  storage: Storage,
  key: string,
  fallback: T,
): T {
  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch (error) {
    return fallback;
  }
}

export function setStorageJSON(storage: Storage, key: string, value: unknown): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // no-op
  }
}

export function removeStorageItem(storage: Storage, key: string): void {
  try {
    storage.removeItem(key);
  } catch (error) {
    // no-op
  }
}
