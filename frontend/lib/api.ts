const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

// ── Token management ──

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ab_token');
}

export function setToken(token: string) {
  localStorage.setItem('ab_token', token);
}

export function clearToken() {
  localStorage.removeItem('ab_token');
}

// ── Fetch wrapper ──

interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  noAuth?: boolean;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { body, noAuth, ...fetchOpts } = opts;
  const headers: Record<string, string> = {
    ...(fetchOpts.headers as Record<string, string>),
  };

  if (!noAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOpts,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try {
      const j = JSON.parse(text);
      msg = j.detail || j.message || text;
    } catch {}
    throw new ApiError(res.status, msg);
  }

  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return res.json();
  }
  return res.text() as unknown as T;
}

// ── SWR fetcher ──

export const swrFetcher = <T>(path: string): Promise<T> => api<T>(path);

// ── Auth helpers ──

export async function login(email: string, password: string) {
  const data = await api<{ token: string }>('/auth/login', {
    method: 'POST',
    body: { email, password },
    noAuth: true,
  });
  setToken(data.token);
  return data;
}

export async function register(email: string, password: string, name: string, company: string) {
  const data = await api<{ token: string }>('/auth/register', {
    method: 'POST',
    body: { email, password, name, company },
    noAuth: true,
  });
  setToken(data.token);
  return data;
}

export async function googleLogin(credential: string) {
  const data = await api<{ token: string }>('/auth/google', {
    method: 'POST',
    body: { credential },
    noAuth: true,
  });
  setToken(data.token);
  return data;
}

export function logout() {
  clearToken();
  window.location.href = '/login';
}
