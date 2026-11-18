import { NextResponse, type NextRequest } from 'next/server';

/** Primeira barreira: sem cookies de sessão, vai para o login. A validação real é feita pela API. */
export function middleware(req: NextRequest) {
  const hasSession = req.cookies.has('access_token') || req.cookies.has('refresh_token');
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/transactions/:path*',
    '/accounts/:path*',
    '/categories/:path*',
    '/budgets/:path*',
    '/settings/:path*',
  ],
};
