import { apiClient, secureStorage } from '@/core';

interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user_id?: string;
  is_new_user?: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  token_type?: string;
}

export class GoogleOAuthService {
  private static instance: GoogleOAuthService;

  private constructor() {}

  static getInstance(): GoogleOAuthService {
    if (!GoogleOAuthService.instance) {
      GoogleOAuthService.instance = new GoogleOAuthService();
    }
    return GoogleOAuthService.instance;
  }

  async exchangeTokenForSession(idToken: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/c56/auth/login',
        { id_token: idToken },
        { 'Content-Type': 'application/json' }
      );

      if (response.error || !response.data) {
        throw new Error(response.error || 'Failed to verify token');
      }

      const { access_token, refresh_token, user } = response.data;

      await this.storeSession(access_token, refresh_token);
      apiClient.setAuthToken(access_token);

      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token exchange failed';
      throw new Error(message);
    }
  }

  async storeSession(accessToken: string, refreshToken?: string): Promise<void> {
    await secureStorage.setItem('auth_access_token', accessToken);
    if (refreshToken) {
      await secureStorage.setItem('auth_refresh_token', refreshToken);
    }
  }

  async retrieveStoredSession(): Promise<string | null> {
    try {
      const token = await secureStorage.getItem('auth_access_token');
      if (token) {
        apiClient.setAuthToken(token);
      }
      return token;
    } catch (error) {
      console.error('Failed to retrieve stored session:', error);
      return null;
    }
  }

  async clearSession(): Promise<void> {
    await secureStorage.removeItem('auth_access_token');
    await secureStorage.removeItem('auth_refresh_token');
    await secureStorage.removeItem('google_email');
    await secureStorage.removeItem('google_name');
    await secureStorage.removeItem('google_user_id');
    await secureStorage.removeItem('google_phone_number');
    apiClient.setAuthToken(null);
  }

  async logout(): Promise<void> {
    try {
      // Revoke via Google Sign-In SDK (web)
      const accessToken = await secureStorage.getItem('auth_access_token');
      if (accessToken && typeof window !== 'undefined') {
        try {
          // @ts-ignore - google.accounts is loaded from Google's script
          if (window.google?.accounts?.id?.revoke) {
            window.google.accounts.id.revoke(accessToken, () => {
              console.log('Google token revoked');
            });
          }
        } catch (error) {
          console.warn('Google revoke failed:', error);
        }
      }
    } finally {
      // Clear all local storage
      await this.clearSession();
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = await secureStorage.getItem('auth_refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post<AuthResponse>(
        '/c56/auth/refresh',
        { refresh_token: refreshToken }
      );

      if (response.error || !response.data) {
        throw new Error(response.error || 'Failed to refresh token');
      }

      const { access_token, refresh_token: newRefreshToken } = response.data;
      await this.storeSession(access_token, newRefreshToken);
      apiClient.setAuthToken(access_token);

      return access_token;
    } catch (error) {
      await this.clearSession();
      const message = error instanceof Error ? error.message : 'Token refresh failed';
      throw new Error(message);
    }
  }
}

export const googleOAuthService = GoogleOAuthService.getInstance();
