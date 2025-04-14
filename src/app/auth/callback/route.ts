import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  console.log('Callback route received:', { code, token_hash, type })

  // Handle password reset flow (don't try to exchange token_hash for session)
  if (token_hash && type === 'email') {
    console.log('Password reset flow detected, redirecting to reset password page')
    // Just pass the token_hash to the reset password page
    return NextResponse.redirect(`${origin}/auth/reset-password?token_hash=${token_hash}&type=${type}`);
  }

  // Handle normal OAuth authentication flow
  if (code) {
    console.log('OAuth flow detected, exchanging code for session')
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }
    
    console.log('Successfully exchanged code for session')
    return NextResponse.redirect(`${origin}${next}`)
  }

  // No valid parameters found
  console.error('No valid authentication parameters found')
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
