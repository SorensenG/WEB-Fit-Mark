import { NextResponse } from 'next/server'
import { FITMARK_BASE_URL, endpoints } from '@/lib/api/endpoints'
import { getTokens, setTokenCookies } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  const { refresh } = getTokens()
  if (!refresh) {
    return NextResponse.json({ message: 'Sem refresh token' }, { status: 401 })
  }

  const upstream = await fetch(`${FITMARK_BASE_URL}${endpoints.refresh}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
    cache: 'no-store',
  })

  if (!upstream.ok) {
    return NextResponse.json({ message: 'Sessão expirada' }, { status: 401 })
  }

  const data = await upstream.json()
  const res = NextResponse.json({ ok: true })
  setTokenCookies(res, data.accessToken, data.refreshToken)
  return res
}
