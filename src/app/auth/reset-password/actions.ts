"use server";

import { createClient } from "@/utils/supabase/server";

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return { error: "Jelszó megadása kötelező." };
  }

  if (password !== confirmPassword) {
    return { error: "A két jelszó nem egyezik." };
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: password,
    }, {
      emailRedirectTo: window.location.origin
    });
    
    if (error) {
      return { error: "Hiba történt a jelszó módosítása során." };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in resetPassword:", error);
    return { error: "Váratlan hiba történt. Kérjük próbálja újra később." };
  }
}
