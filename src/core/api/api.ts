import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl ||
  (process.env.NODE_ENV === 'development'
    ? 'http://192.168.0.105:8000'
    : 'https://api.yourproduction.com');

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    customHeaders: Record<string, string> = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...customHeaders,
        ...(options.headers as Record<string, string>),
      };

      if (this.authToken) {
        headers.Authorization = `Bearer ${this.authToken}`;
      }

      console.log(`[API] ${options.method || 'GET'} ${url}`, {
        baseUrl: this.baseUrl,
        endpoint,
        hasAuth: !!this.authToken,
      });

      const response = await fetch(url, {
        headers,
        ...options,
      });

      const data = await response.json().catch(() => null);

      console.log(`[API] Response: ${response.status} from ${url}`);

      return {
        data: data,
        status: response.status,
        error: !response.ok ? `HTTP ${response.status}` : undefined,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`[API] Error calling ${options.method || 'GET'} ${this.baseUrl}${endpoint}:`, errorMsg);
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
