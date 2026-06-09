const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type RequestOptions = RequestInit & {
  params?: Record<string, string | number>;
};

class ApiClient {
  private onUnauthorizedCallback: (() => void) | null = null;

  onUnauthorized(callback: () => void) {
    this.onUnauthorizedCallback = callback;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, ...rest } = options;
    
    let url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        searchParams.append(key, String(val));
      });
      url += `?${searchParams.toString()}`;
    }

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const isMultipart = rest.body instanceof FormData;
    const finalHeaders = isMultipart
      ? (headers as Record<string, string> || {})
      : { ...defaultHeaders, ...(headers as Record<string, string>) };

    const config: RequestInit = {
      ...rest,
      headers: finalHeaders,
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        if (this.onUnauthorizedCallback) {
          this.onUnauthorizedCallback();
        }
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        let errorData;
        try {
          const text = await response.text();
          try {
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: text };
          }
        } catch {
          errorData = { message: response.statusText };
        }
        
        // Handle nest global transform or exception filter structure
        // e.g. { message: "Error text", statusCode: 400 } or { data: null, error: { message, statusCode } }
        const errorMessage = errorData.error?.message || errorData.message || 'Something went wrong';
        throw new Error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
      }

      if (response.status === 204) {
        return {} as T;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const json = await response.json();
        // Check if Nest response uses global TransformInterceptor: e.g. { data: ... }
        if (json && typeof json === 'object' && 'data' in json && !('error' in json)) {
          return json.data as T;
        }
        return json as T;
      }
      
      const text = await response.text();
      try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === 'object' && 'data' in parsed && !('error' in parsed)) {
          return parsed.data as T;
        }
        return parsed as T;
      } catch {
        return text as unknown as T;
      }
    } catch (error) {
      throw error;
    }
  }

  get<T>(path: string, options?: RequestOptions) {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, body?: any, options?: RequestOptions) {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  put<T>(path: string, body?: any, options?: RequestOptions) {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  delete<T>(path: string, options?: RequestOptions) {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
