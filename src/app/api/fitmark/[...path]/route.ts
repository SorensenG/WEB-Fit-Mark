import { NextRequest, NextResponse } from 'next/server'
import { FITMARK_BASE_URL } from '@/lib/api/endpoints'
import { clearTokenCookies, getTokens, refreshTokenPair, setTokenCookies } from '@/lib/auth'

type Params = { params: { path: string[] } }

async function proxyRequest(req: NextRequest, { params }: Params) {
  const path = '/' + params.path.join('/')
  const search = req.nextUrl.search
  const url = `${FITMARK_BASE_URL}${path}${search}`

  let { access, refresh } = getTokens()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
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

  if (access) headers['Authorization'] = `Bearer ${access}`

  const body =
    req.method !== 'GET' && req.method !== 'HEAD'
      ? await req.text()
      : undefined

  let upstream = await fetch(url, { method: req.method, headers, body })

  // Auto-refresh on expired/invalid access token.
  if ((upstream.status === 401 || upstream.status === 403) && refresh) {
    const tokens = await refreshTokenPair(refresh)
    if (tokens) {
      access = tokens.accessToken
      refresh = tokens.refreshToken
      headers['Authorization'] = `Bearer ${access}`
      upstream = await fetch(url, { method: req.method, headers, body })
    }
  }

  const contentType = upstream.headers.get('content-type') ?? ''
  let responseBody: string | null = null
  if (upstream.status !== 204) {
    responseBody = await upstream.text()
  }

  const res = new NextResponse(responseBody, {
    status: upstream.status,
    headers: { 'Content-Type': contentType || 'application/json' },
  })

  if (access && refresh) {
    setTokenCookies(res, access, refresh)
  }

  return res
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const PATCH = proxyRequest
export const DELETE = proxyRequest
