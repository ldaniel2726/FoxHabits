import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/profile',
    '/login',
    '/signup',
    '/forgot-password',
    '/auth/reset-password',
    '/admin',
    '/habits',
    '/habits/today',
    '/habits/create',
    '/habits/edit',
    '/habits/add',
    '/settings',
    '/statistics'
  ],
}
