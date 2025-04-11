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
    '/habits/*',
    '/habits/today',
    '/habits/today/*',
    '/habits/create',
    '/habits/create/*',
    '/habits/edit',
    '/habits/edit/*',
    '/habits/add',
    '/habits/add/*',
    '/settings',
    '/statistics'
  ],
}
