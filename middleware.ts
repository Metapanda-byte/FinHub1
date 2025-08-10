import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allowlist: home and signup
  const allowedExact = new Set<string>(['/', '/signup', '/signup/']);
  if (allowedExact.has(pathname)) {
    return NextResponse.next();
  }

  // Static/Next internals and common assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/images') ||
    pathname === '/favicon.ico' ||
    pathname === '/og-image.jpg' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  // Everything else redirects to the homepage
  const url = req.nextUrl.clone();
  url.pathname = '/';
  url.search = '';
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: ['/((?!.*).*)'],
}; 