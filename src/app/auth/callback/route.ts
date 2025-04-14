import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  console.log('Callback route received:', { code, token_hash, type })

  if (token_hash && type === 'email') {
    return NextResponse.redirect(`${origin}/auth/reset-password?token_hash=${token_hash}&type=${type}`);
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }
    
    return NextResponse.redirect(`${origin}${next}`)
  }

  console.error('No valid authentication parameters found')
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
