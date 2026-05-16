import { useState, useCallback } from 'react';
import { apiClient } from '../api/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const get = useCallback(async (endpoint: string) => {
    setState({ data: null, loading: true, error: null });
    const response = await apiClient.get<T>(endpoint);

    if (response.error) {
      setState({ data: null, loading: false, error: response.error });
    } else {
      setState({ data: response.data || null, loading: false, error: null });
    }
    return response;
  }, []);

  const post = useCallback(async (endpoint: string, body?: any) => {
    setState({ data: null, loading: true, error: null });
    const response = await apiClient.post<T>(endpoint, body);

    if (response.error) {
      setState({ data: null, loading: false, error: response.error });
    } else {
      setState({ data: response.data || null, loading: false, error: null });
    }
    return response;
  }, []);

  return { ...state, get, post };
}
