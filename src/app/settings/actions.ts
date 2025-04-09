'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function updateSettings(formData: FormData) {
  const supabase = await createClient()

  const dark_mode = formData.get('theme')
  const localization = formData.get('language')
  const email_notifications = formData.get('emailNotifications') === 'on'

  const { error } = await supabase.from('settings').upsert({
    dark_mode,
    localization,
    email_notifications,
  })

  if (error) {
    return { success: false, message: 'Valami hiba történt. Ellenőrizd az internet kapcsolatodat.' }
  }

  revalidatePath('/settings')

  return { success: true, message: 'Beállítások frissítve.' }
}

export async function getSettings() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase.from('settings').select('*').eq('user_id', user?.id)
  
  if (error) {
    return { success: false, message: 'Valami hiba történt. Ellenőrizd az internet kapcsolatodat.', data: null }
  }

  return { success: true, message: 'Beállítások betöltve.', data }
}
