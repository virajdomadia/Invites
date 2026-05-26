const baseURL = process.env.EXPO_PUBLIC_UNIVERSAL_API_BASE_URL;
const apiKey = process.env.EXPO_PUBLIC_X_API_KEY;

export const universalApi = {
  get: (url: string, config?: any) =>
    fetch(`${baseURL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey || '',
        ...config?.headers,
      },
      ...config,
    }).then(r => r.json()),

  post: (url: string, data?: any, config?: any) =>
    fetch(`${baseURL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey || '',
        ...config?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    }).then(r => r.json()),

  put: (url: string, data?: any, config?: any) =>
    fetch(`${baseURL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey || '',
        ...config?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    }).then(r => r.json()),

  delete: (url: string, config?: any) =>
    fetch(`${baseURL}${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey || '',
        ...config?.headers,
      },
      ...config,
    }).then(r => r.json()),
};
