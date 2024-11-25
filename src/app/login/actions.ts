'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    if (error.code === 'email_not_confirmed') {
      return { error: "Kérjük erősítsd meg az email címedet." }
    } else {
      return { error: "Ismeretlen hiba. Próbálja újra." }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/profile')
}
