const LOCAL_APP_URL = 'http://localhost:3000'

function cleanUrl(value?: string | null) {
  const cleaned = value?.trim().replace(/\/+$/, '')
  if (!cleaned) return undefined
  return cleaned
}

export function getAppUrl() {
  const configuredUrl = cleanUrl(process.env.NEXTAUTH_URL)
  if (configuredUrl) return configuredUrl

  const vercelProductionUrl = cleanUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL)
  if (vercelProductionUrl) return `https://${vercelProductionUrl}`

  const vercelUrl = cleanUrl(process.env.VERCEL_URL)
  if (vercelUrl) return `https://${vercelUrl}`

  return LOCAL_APP_URL
}

export function getGoogleRedirectUri() {
  return `${getAppUrl()}/api/auth/google/callback`
}

export function getGoogleClientConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()

  return {
    clientId,
    clientSecret,
    isConfigured: Boolean(clientId && clientSecret),
  }
}
