export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const;

export type HTTPMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

export type RequestOptions = {
  method?: HTTPMethod;
  data?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
};

export type HTTPError = {
  status: number;
  reason: string;
};

function buildQuery(data: Record<string, unknown>): string {
  const params = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    params.append(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

function tryParseJSON(body: string): unknown {
  if (!body) {
    return null;
  }

  try {
    return JSON.parse(body);
  } catch (error) {
    return body;
  }
}

function toHTTPError(status: number, response: unknown, fallbackReason: string): Error {
  const reason = (response as HTTPError | null)?.reason ?? fallbackReason;
  const requestError = new Error(`HTTP ${status}: ${reason}`);
  Object.assign(requestError, { status, reason });
  return requestError;
}

export default class HTTPTransport {
  constructor(private readonly baseUrl: string = '') {}

  get(url: string, options: RequestOptions = {}): Promise<unknown> {
    const { data, ...rest } = options;
    const query = data && typeof data === 'object' ? buildQuery(data as Record<string, unknown>) : '';
    return this.request(`${url}${query}`, { ...rest, method: HTTP_METHODS.GET });
  }

  post(url: string, options: RequestOptions = {}): Promise<unknown> {
    return this.request(url, { ...options, method: HTTP_METHODS.POST });
  }

  put(url: string, options: RequestOptions = {}): Promise<unknown> {
    return this.request(url, { ...options, method: HTTP_METHODS.PUT });
  }

  delete(url: string, options: RequestOptions = {}): Promise<unknown> {
    return this.request(url, { ...options, method: HTTP_METHODS.DELETE });
  }

  request(url: string, options: RequestOptions): Promise<unknown> {
    const {
      method = HTTP_METHODS.GET, data, headers = {}, timeout = 5000,
    } = options;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, `${this.baseUrl}${url}`);
      xhr.withCredentials = true;

      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.onload = () => {
        const isJson = xhr.getResponseHeader('content-type')?.includes('application/json');
        const response = isJson ? tryParseJSON(xhr.responseText) : xhr.responseText;

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(response);
          return;
        }

        reject(toHTTPError(xhr.status, response, xhr.statusText));
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.onabort = () => reject(new Error('Request aborted'));
      xhr.ontimeout = () => reject(new Error('Request timeout'));
      xhr.timeout = timeout;

      if (method === HTTP_METHODS.GET || data === undefined) {
        xhr.send();
      } else if (data instanceof FormData) {
        xhr.send(data);
      } else {
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
      }
    });
  }
}
