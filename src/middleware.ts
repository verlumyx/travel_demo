import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // === ADMIN ROUTES ===
  // Protected by better-auth session cookie
  if (pathname.startsWith('/admin')) {
    // Allow login page without auth
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Check better-auth session cookie
    const sessionCookie = request.cookies.get('better-auth.session_token');
    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
  }

  // === PORTAL CLIENT ROUTES ===
  // Only /cuenta/* requires Supabase auth
  if (pathname.startsWith('/cuenta')) {
    const response = NextResponse.next();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && pathname !== '/cuenta/login') {
      return NextResponse.redirect(new URL('/cuenta/login', request.url));
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/cuenta/:path*',
  ],
};
