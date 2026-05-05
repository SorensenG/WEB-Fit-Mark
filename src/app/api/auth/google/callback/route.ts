import { NextRequest, NextResponse } from 'next/server'
import { sha256 } from 'js-sha256'
import { FITMARK_BASE_URL, endpoints } from '@/lib/api/endpoints'
import { setTokenCookies } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  const appUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=google_cancelled`)
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
  const redirectUri = `${appUrl}/api/auth/google/callback`

  // Exchange code for Google tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${appUrl}/login?error=google_token_failed`)
  }

  const tokenData = await tokenRes.json()
  const googleAccessToken = tokenData.access_token

  // Get Google user info
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${googleAccessToken}` },
  })

  if (!userRes.ok) {
    return NextResponse.redirect(`${appUrl}/login?error=google_userinfo_failed`)
  }

  const googleUser = await userRes.json()
  const email: string = googleUser.email
  const username: string = googleUser.name ?? email.split('@')[0]
  // Replicate Flutter: password = sha256(google sub/id)
  const password = sha256(googleUser.id)

  // Try login, fallback to register+login
  let fitmarkLogin = await fetch(`${FITMARK_BASE_URL}${endpoints.login}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!fitmarkLogin.ok) {
    // Register the user
    await fetch(`${FITMARK_BASE_URL}${endpoints.register}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    })
    fitmarkLogin = await fetch(`${FITMARK_BASE_URL}${endpoints.login}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  }

  if (!fitmarkLogin.ok) {
    return NextResponse.redirect(`${appUrl}/login?error=fitmark_auth_failed`)
  }

  const fitmarkData = await fitmarkLogin.json()
  const redirectRes = NextResponse.redirect(`${appUrl}/`)
  setTokenCookies(redirectRes, fitmarkData.accessToken, fitmarkData.refreshToken)
  return redirectRes
}
