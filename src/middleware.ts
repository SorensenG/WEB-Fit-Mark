import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password']
const AUTH_PATHS = ['/api/auth/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow auth API routes and static files
  if (
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon')
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
