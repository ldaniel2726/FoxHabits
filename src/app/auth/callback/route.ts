import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const type = searchParams.get('type')
  const token = searchParams.get('token')

  // Handle password reset flow
  if (type === 'recovery' && token) {
    // Redirect to the password reset page with the token
    return NextResponse.redirect(`${origin}/auth/reset-password?token=${token}&type=${type}`)
  }

  // Handle normal authentication flow
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Handle error
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
