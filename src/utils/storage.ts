const NAMESPACE = "zama-fhevm-plugin2";

export function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(`${NAMESPACE}.${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${NAMESPACE}.${key}`, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save ${key} to storage:`, error);
  }
}

export function safeRemove(key: string): void {
  try {
    localStorage.removeItem(`${NAMESPACE}.${key}`);
  } catch (error) {
    console.warn(`Failed to remove ${key} from storage:`, error);
  }
}

export function safeClear(): void {
  try {
    Object.keys(localStorage)
      .filter(key => key.startsWith(`${NAMESPACE}.`))
      .forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Failed to clear storage:', error);
  }
}