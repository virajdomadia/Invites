import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://192.168.1.7:8000'
    : 'https://api.yourproduction.com');

console.log('[API Client] Using API URL:', API_URL);

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;
  private refreshToken: string | null = null;
  private onTokenRefresh: ((newToken: string) => void) | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  setRefreshToken(token: string | null): void {
    this.refreshToken = token;
  }

  setTokenRefreshCallback(callback: (newToken: string) => void): void {
    this.onTokenRefresh = callback;
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        if (!this.refreshToken) {
          return null;
        }

        const url = `${this.baseUrl}/c56/auth/refresh`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: this.refreshToken,
          }),
        });

        const data = await response.json().catch(() => null);

        if (response.ok && data?.access_token) {
          const newToken = data.access_token;
          this.authToken = newToken;
          this.onTokenRefresh?.(newToken);
          console.log('[API] Token refreshed successfully');
          return newToken;
        } else {
          console.error('[API] Token refresh failed', {
            status: response.status,
            data,
          });
          return null;
        }
      } catch (error) {
        console.error('[API] Token refresh error:', error);
        return null;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    customHeaders: Record<string, string> = {},
    retried = false
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...customHeaders,
        ...(options.headers as Record<string, string>),
      };

      const hasAuthToken = !!this.authToken;
      if (this.authToken) {
        headers.Authorization = `Bearer ${this.authToken}`;
      }

      console.log(`[API] ${options.method || 'GET'} ${url}`, {
        auth: hasAuthToken ? 'present' : 'missing',
      });

      const response = await fetch(url, {
        headers,
        ...options,
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401 && !retried && this.refreshToken) {
        console.log('[API] Got 401, attempting token refresh');
        const newToken = await this.refreshAccessToken();

        if (newToken) {
          console.log('[API] Retrying request with new token');
          return this.request<T>(endpoint, options, customHeaders, true);
        }
      }

      if (!response.ok) {
        console.error(`[API Error] ${options.method || 'GET'} ${url}`, {
          status: response.status,
          statusText: response.statusText,
          auth: hasAuthToken ? 'present' : 'missing',
          responseData: data,
        });
      }

      return {
        data: data,
        status: response.status,
        error: !response.ok ? `HTTP ${response.status}` : undefined,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`[API Error] ${errorMsg}`, {
        endpoint,
        auth: this.authToken ? 'present' : 'missing',
      });
      return {
        status: 0,
        error: errorMsg,
      };
    }
  }

  async get<T>(
    endpoint: string,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, customHeaders);
  }

  async post<T>(
    endpoint: string,
    body?: any,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      customHeaders
    );
  }

  async put<T>(
    endpoint: string,
    body?: any,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      },
      customHeaders
    );
  }

  async delete<T>(
    endpoint: string,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, customHeaders);
  }

  async patch<T>(
    endpoint: string,
    body?: any,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
      },
      customHeaders
    );
  }
}

export const apiClient = new ApiClient();
