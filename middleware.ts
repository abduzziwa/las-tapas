import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET ?? process.env.QR_SECRET ?? 'change-me-in-production'
  );

const PROTECTED_PATHS = ['/waiter', '/bar', '/chef', '/Admin', '/staff-welcome'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get('staff_session')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(token, secret());
    return NextResponse.next();
  } catch {
    // Token invalid or expired — clear cookie and redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.set('staff_session', '', { maxAge: 0, path: '/' });
    return res;
  }
}

export const config = {
  matcher: ['/waiter/:path*', '/bar/:path*', '/chef/:path*', '/Admin/:path*', '/staff-welcome'],
};
