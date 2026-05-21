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
        console.log(`📖 SecureStore.getItem('${key}'):`, result ? '✅ found' : '❌ not found');
        return result;
      }
    } catch (error) {
      console.error(`❌ SecureStore.getItem('${key}') failed:`, error);
    }
    const fallback = inMemoryStore.get(key);
    console.log(`📖 Fallback in-memory.getItem('${key}'):`, fallback ? '✅ found' : '❌ not found');
    return fallback ?? null;
  },

  async setItem(key: string, value: string): Promise<void> {
    inMemoryStore.set(key, value);
    console.log(`💾 Storing to in-memory: '${key}'`);
    try {
      if (isSecureStoreAvailable && secureStore?.setItemAsync) {
        await secureStore.setItemAsync(key, value);
        console.log(`✅ SecureStore.setItem('${key}') success`);
      } else {
        console.warn(`⚠️ SecureStore not available for '${key}'`);
      }
    } catch (error) {
      console.error(`❌ SecureStore.setItem('${key}') failed:`, error);
    }
  },

  async removeItem(key: string): Promise<void> {
    inMemoryStore.delete(key);
    console.log(`🗑️ Removed from in-memory: '${key}'`);
    try {
      if (isSecureStoreAvailable && secureStore?.deleteItemAsync) {
        await secureStore.deleteItemAsync(key);
        console.log(`✅ SecureStore.deleteItem('${key}') success`);
      }
    } catch (error) {
      console.error(`❌ SecureStore.deleteItem('${key}') failed:`, error);
    }
  },
};
