import { apiClient } from '../../../core/api/api';
import { secureStorage } from '../../../core/storage/secure-storage';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: string;
  is_new_user: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  phone_number?: string;
  is_new_user: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  tokens: { access: string; refresh: string } | null;
  loading: boolean;
  error: string | null;
}

const SECURE_STORE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user',
};

export class AuthService {
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
    tokens: null,
    loading: false,
    error: null,
  };

  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    this.restoreSession();
  }

  private async restoreSession() {
    try {
      const accessToken = await secureStorage.getItem(
        SECURE_STORE_KEYS.ACCESS_TOKEN
      );
      const refreshToken = await secureStorage.getItem(
        SECURE_STORE_KEYS.REFRESH_TOKEN
      );
      const userJson = await secureStorage.getItem(SECURE_STORE_KEYS.USER);

      if (accessToken && refreshToken && userJson) {
        this.state = {
          isAuthenticated: true,
          user: JSON.parse(userJson),
          tokens: { access: accessToken, refresh: refreshToken },
          loading: false,
          error: null,
        };
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getState(): AuthState {
    return this.state;
  }

  async loginWithGoogle(idToken: string, googleUserInfo: any) {
    this.state.loading = true;
    this.state.error = null;
    this.notifyListeners();

    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        id_token: idToken,
      });

      if (response.error || !response.data) {
        throw new Error(response.error || 'Login failed');
      }

      const { access_token, refresh_token, user_id, is_new_user } =
        response.data;

      const user: User = {
        id: user_id,
        email: googleUserInfo.email,
        name: googleUserInfo.name,
        picture: googleUserInfo.picture,
        is_new_user,
      };

      // Save tokens and user info to secure storage
      await secureStorage.setItem(SECURE_STORE_KEYS.ACCESS_TOKEN, access_token);
      await secureStorage.setItem(SECURE_STORE_KEYS.REFRESH_TOKEN, refresh_token);
      await secureStorage.setItem(SECURE_STORE_KEYS.USER, JSON.stringify(user));

      this.state = {
        isAuthenticated: true,
        user,
        tokens: { access: access_token, refresh: refresh_token },
        loading: false,
        error: null,
      };

      this.notifyListeners();

      return { success: true, user, is_new_user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      this.state = {
        ...this.state,
        loading: false,
        error: errorMessage,
      };
      this.notifyListeners();

      return { success: false, error: errorMessage };
    }
  }

  async refreshToken(): Promise<boolean> {
    if (!this.state.tokens?.refresh) {
      return false;
    }

    try {
      const response = await apiClient.post<{ access_token: string }>(
        '/auth/refresh',
        { refresh_token: this.state.tokens.refresh }
      );

      if (response.error || !response.data) {
        throw new Error('Token refresh failed');
      }

      const { access_token } = response.data;

      await secureStorage.setItem(SECURE_STORE_KEYS.ACCESS_TOKEN, access_token);

      if (this.state.tokens) {
        this.state.tokens.access = access_token;
        this.notifyListeners();
      }

      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  async logout() {
    try {
      await secureStorage.removeItem(SECURE_STORE_KEYS.ACCESS_TOKEN);
      await secureStorage.removeItem(SECURE_STORE_KEYS.REFRESH_TOKEN);
      await secureStorage.removeItem(SECURE_STORE_KEYS.USER);
    } catch (error) {
      console.error('Failed to clear secure storage:', error);
    }

    this.state = {
      isAuthenticated: false,
      user: null,
      tokens: null,
      loading: false,
      error: null,
    };

    this.notifyListeners();
  }

  async sendPhoneOTP(phoneNumber: string): Promise<boolean> {
    if (!this.state.tokens?.access) {
      this.state.error = 'Not authenticated';
      return false;
    }

    try {
      const response = await apiClient.post(
        '/auth/send-phone-otp',
        { phone_number: phoneNumber },
        {
          Authorization: `Bearer ${this.state.tokens.access}`,
        }
      );

      if (response.error) {
        this.state.error = response.error;
        this.notifyListeners();
        return false;
      }

      return true;
    } catch (err) {
      this.state.error = err instanceof Error ? err.message : 'Failed to send OTP';
      this.notifyListeners();
      return false;
    }
  }

  async verifyPhoneOTP(phoneNumber: string, otp: string): Promise<boolean> {
    if (!this.state.tokens?.access) {
      this.state.error = 'Not authenticated';
      return false;
    }

    try {
      const response = await apiClient.post(
        '/auth/verify-phone',
        { phone_number: phoneNumber, otp },
        {
          Authorization: `Bearer ${this.state.tokens.access}`,
        }
      );

      if (response.error) {
        this.state.error = response.error;
        this.notifyListeners();
        return false;
      }

      // Update user with verified phone
      if (this.state.user) {
        this.state.user.phone_number = phoneNumber;
        await secureStorage.setItem(
          SECURE_STORE_KEYS.USER,
          JSON.stringify(this.state.user)
        );
        this.notifyListeners();
      }

      return true;
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'OTP verification failed';
      this.notifyListeners();
      return false;
    }
  }

  getAccessToken(): string | null {
    return this.state.tokens?.access || null;
  }
}

export const authService = new AuthService();
