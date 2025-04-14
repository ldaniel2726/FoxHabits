import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (token && type === 'email') {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(token)
    
    console.log(error)

    return NextResponse.redirect(`${origin}/reset-password?token_hash=${token}&type=email`);
    
    /*if (!error) {
      return NextResponse.redirect(`${origin}/reset-password?token_hash=${token}&type=email`);
    }*/
  }

  // todo: handle error and make an error page
  //return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
