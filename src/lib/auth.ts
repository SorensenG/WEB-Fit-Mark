import { cookies } from 'next/headers'
import { FITMARK_BASE_URL, endpoints } from './api/endpoints'

const ACCESS_COOKIE = 'fm_access'
const REFRESH_COOKIE = 'fm_refresh'

type TokenPair = {
  accessToken: string
  refreshToken: string
}

const refreshRequests = new Map<string, Promise<TokenPair | null>>()

export function getTokens() {
  const store = cookies()
  return {
    access: store.get(ACCESS_COOKIE)?.value ?? null,
    refresh: store.get(REFRESH_COOKIE)?.value ?? null,
  }
}

export function setTokenCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  const maxAge30d = 60 * 60 * 24 * 30
  const maxAge15m = 60 * 15

  res.headers.append(
    'Set-Cookie',
    `${ACCESS_COOKIE}=${accessToken}; HttpOnly; Path=/; Max-Age=${maxAge15m}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
  )
  res.headers.append(
    'Set-Cookie',
    `${REFRESH_COOKIE}=${refreshToken}; HttpOnly; Path=/; Max-Age=${maxAge30d}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
  )
}

export function clearTokenCookies(res: Response) {
  res.headers.append(
    'Set-Cookie',
    `${ACCESS_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`,
  )
  res.headers.append(
    'Set-Cookie',
    `${REFRESH_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`,
  )
}

export async function refreshTokenPair(
  currentRefreshToken?: string | null,
): Promise<TokenPair | null> {
  const refreshToken =
    currentRefreshToken ?? cookies().get(REFRESH_COOKIE)?.value
  if (!refreshToken) return null

  const pendingRefresh = refreshRequests.get(refreshToken)
  if (pendingRefresh) return pendingRefresh

  const refreshRequest = requestTokenRefresh(refreshToken).finally(() => {
    refreshRequests.delete(refreshToken)
  })

  refreshRequests.set(refreshToken, refreshRequest)
  return refreshRequest
}

async function requestTokenRefresh(
  refreshToken: string,
): Promise<TokenPair | null> {
  try {
    const res = await fetch(`${FITMARK_BASE_URL}${endpoints.refresh}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.accessToken || !data.refreshToken) return null
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    }
  } catch {
    return null
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  const tokens = await refreshTokenPair()
  return tokens?.accessToken ?? null
}

export function isAuthenticated(): boolean {
  const store = cookies()
  return !!(
    store.get(ACCESS_COOKIE)?.value || store.get(REFRESH_COOKIE)?.value
  )
}
