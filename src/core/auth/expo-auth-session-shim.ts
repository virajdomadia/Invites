// Shim for expo-auth-session that provides fallbacks for web/development
let GoogleAuth: any = null;
let WebBrowser: any = null;

try {
  GoogleAuth = require('expo-auth-session/providers/google').default;
  WebBrowser = require('expo-web-browser');
  WebBrowser.maybeCompleteAuthSession?.();
} catch (e) {
  console.warn('expo-auth-session not available, using web fallback');
  // Provide mock implementations for web development
  GoogleAuth = null;
  WebBrowser = {
    maybeCompleteAuthSession: () => {},
    openAuthSessionAsync: async () => ({ type: 'dismiss' }),
  };
}

export { GoogleAuth, WebBrowser };
