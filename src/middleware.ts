import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Define public routes
  const publicRoutes = ['/login', '/signup'];
  
  const token = req.cookies.get('supabase-auth-token'); // Replace with your session mechanism
  
  if (token && publicRoutes.includes(pathname)) {
    // Redirect logged-in users away from public routes
    return NextResponse.redirect(new URL('/profile', req.url));
  }

  return NextResponse.next();
}
