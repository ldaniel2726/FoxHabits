'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const name = formData.get('name') as string

  if (password !== confirmPassword) {
    return { error: 'A jelszavak nem egyeznek.' }
  }

  if (!email || !password || !name) {
    return { error: 'Minden mező kitöltése kötelező.' }
  }

  if (password.length < 8 || !/[0-9]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { error: 'A jelszónak legalább 8 karakter hosszúnak kell lennie, és tartalmaznia kell legalább egy számot és egy speciális karaktert.' }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Érvénytelen email cím.' }
  }

  if (name.length < 2) {
    return { error: 'A névnek legalább 2 karakter hosszúnak kell lennie.' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}
