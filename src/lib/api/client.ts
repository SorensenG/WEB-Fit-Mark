'use client'

// Client-side fetcher — all requests proxy through /api/fitmark/
// which attaches the httpOnly token server-side.

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
  ) {
    super(message)
  }
}

let refreshPromise: Promise<boolean> | null = null

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retryOnUnauthorized = true,
): Promise<T> {
  const url = `/api/fitmark${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  })

  if ((res.status === 401 || res.status === 403) && retryOnUnauthorized) {
    const refreshed = await refreshSession()
    if (refreshed) {
      return request<T>(path, options, false)
    }
  }

  if (!res.ok) {
    let message = 'Erro de conexão'
    try {
      const body = await res.json()
      message = body.message || body.error || message
    } catch {}
    throw new ApiError(message, res.status)
  }

  if (res.status === 204) return undefined as T

  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text)
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
