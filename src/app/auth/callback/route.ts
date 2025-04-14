import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token = searchParams.get('token_hash')
  const next = searchParams.get('next') ?? '/'

  if (token) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(token)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // todo: handle error and make an error page
  //return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
