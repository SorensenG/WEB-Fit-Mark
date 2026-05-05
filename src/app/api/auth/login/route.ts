import { NextRequest, NextResponse } from 'next/server'
import { FITMARK_BASE_URL, endpoints } from '@/lib/api/endpoints'
import { setTokenCookies } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const upstream = await fetch(`${FITMARK_BASE_URL}${endpoints.login}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await upstream.json()

  if (!upstream.ok) {
    return NextResponse.json(
      { message: data.message || 'Credenciais inválidas' },
      { status: upstream.status },
    )
  }

  const res = NextResponse.json({ ok: true })
  setTokenCookies(res, data.accessToken, data.refreshToken)
  return res
}
