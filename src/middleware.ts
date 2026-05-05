import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password']
const PUBLIC_FILE = /\.(.*)$/

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // API routes and public/static files must answer directly.
  // Redirecting fetches/assets to /login turns auth expiration into broken UI.
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname === '/site.webmanifest' ||
    pathname === '/manifest.json' ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  const access = request.cookies.get('fm_access')?.value
  const refresh = request.cookies.get('fm_refresh')?.value
  const isLoggedIn = !!(access || refresh)

  const isPublicPage = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  if (!isLoggedIn && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isLoggedIn && isPublicPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
