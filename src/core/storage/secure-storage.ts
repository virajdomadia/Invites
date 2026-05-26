// In-memory fallback for development
const inMemoryStore = new Map<string, string>();
let secureStore: any = null;
let isSecureStoreAvailable = false;

try {
  secureStore = require('expo-secure-store');
  // Test if the native module is actually available
  if (secureStore?.getItemAsync) {
    isSecureStoreAvailable = true;
  }
} catch (e) {
  // SecureStore not available
}

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (isSecureStoreAvailable && secureStore?.getItemAsync) {
        const result = await secureStore.getItemAsync(key);
        return result;
      }
    } catch (error) {
      // Silently fall through to in-memory store
    }
    const fallback = inMemoryStore.get(key);
    return fallback ?? null;
  },

  async setItem(key: string, value: string): Promise<void> {
    inMemoryStore.set(key, value);
    try {
      if (isSecureStoreAvailable && secureStore?.setItemAsync) {
        await secureStore.setItemAsync(key, value);
      }
    } catch (error) {
      // Silently continue - in-memory store already set
    }
  },

  async removeItem(key: string): Promise<void> {
    inMemoryStore.delete(key);
    try {
      if (isSecureStoreAvailable && secureStore?.deleteItemAsync) {
        await secureStore.deleteItemAsync(key);
      }
    } catch (error) {
      // Silently continue - in-memory store already removed
    }
  },
};
