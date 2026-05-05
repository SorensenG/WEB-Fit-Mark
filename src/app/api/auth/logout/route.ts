import { NextRequest, NextResponse } from 'next/server'
import { FITMARK_BASE_URL, endpoints } from '@/lib/api/endpoints'
import { getTokens, clearTokenCookies } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { refresh } = getTokens()

  if (refresh) {
    await fetch(`${FITMARK_BASE_URL}${endpoints.logout}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    }).catch(() => {})
  }

  const res = NextResponse.json({ ok: true })
  clearTokenCookies(res)
  return res
}
