import { NextResponse } from 'next/server'
import { getGoogleClientConfig, getGoogleRedirectUri } from '@/lib/google-oauth'

export async function GET() {
  const { clientId } = getGoogleClientConfig()
  if (!clientId) {
    return NextResponse.json(
      { message: 'GOOGLE_CLIENT_ID não configurado' },
      { status: 500 },
    )
  }

  const redirectUri = getGoogleRedirectUri()

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  })

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
  )
}
