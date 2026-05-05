import { NextResponse } from 'next/server'
import { FITMARK_BASE_URL, endpoints } from '@/lib/api/endpoints'
import { getTokens, setTokenCookies, clearTokenCookies } from '@/lib/auth'

export async function POST() {
  const { refresh } = getTokens()
  if (!refresh) {
    return NextResponse.json({ message: 'Sem refresh token' }, { status: 401 })
  }

  const upstream = await fetch(`${FITMARK_BASE_URL}${endpoints.refresh}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  })

  if (!upstream.ok) {
    const res = NextResponse.json({ message: 'Sessão expirada' }, { status: 401 })
    clearTokenCookies(res)
    return res
  }

  const data = await upstream.json()
  const res = NextResponse.json({ ok: true })
  setTokenCookies(res, data.accessToken, data.refreshToken)
  return res
}
