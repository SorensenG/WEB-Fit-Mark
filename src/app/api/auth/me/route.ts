import { NextResponse } from 'next/server'
import { FITMARK_BASE_URL, endpoints } from '@/lib/api/endpoints'
import { clearTokenCookies, getTokens, refreshTokenPair, setTokenCookies } from '@/lib/auth'

export async function GET() {
  let { access, refresh } = getTokens()

  if (!access && !refresh) {
    return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
  }

  if (!access && refresh) {
    const tokens = await refreshTokenPair(refresh)
    if (!tokens) {
      const res = NextResponse.json({ message: 'Sessão expirada' }, { status: 401 })
      clearTokenCookies(res)
      return res
    }
    access = tokens.accessToken
    refresh = tokens.refreshToken
  }

  let upstream = await fetch(`${FITMARK_BASE_URL}${endpoints.me}`, {
    headers: { Authorization: `Bearer ${access}` },
  })

  if ((upstream.status === 401 || upstream.status === 403) && refresh) {
    const tokens = await refreshTokenPair(refresh)
    if (!tokens) {
      const res = NextResponse.json({ message: 'Sessão expirada' }, { status: 401 })
      clearTokenCookies(res)
      return res
    }
    access = tokens.accessToken
    refresh = tokens.refreshToken
    upstream = await fetch(`${FITMARK_BASE_URL}${endpoints.me}`, {
      headers: { Authorization: `Bearer ${access}` },
    })
  }

  const data = await upstream.json()
  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status })
  }

  const res = NextResponse.json(data)
  if (access && refresh) setTokenCookies(res, access, refresh)
  return res
}
