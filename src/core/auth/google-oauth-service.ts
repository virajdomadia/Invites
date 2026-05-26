import { apiClient } from '@/core/api/api';
import { secureStorage } from '@/core/storage/secure-storage';

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
      console.log('[GoogleOAuth] Exchanging token for session...');

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('API request timeout after 30s')), 30000)
      );

      const response = await Promise.race([
        apiClient.post<AuthResponse>(
          '/c56/auth/login',
          { id_token: idToken },
          { 'Content-Type': 'application/json' }
        ),
        timeoutPromise,
      ]);

      console.log('[GoogleOAuth] API Response:', { status: response.status, error: response.error, hasData: !!response.data, data: response.data });

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
      // Logout handled by clearing session
      // Native Google Sign-In handles revocation automatically
      await this.clearSession();
    } catch (error) {
      // Silently fail - logout is best-effort
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
