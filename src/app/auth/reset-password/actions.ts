"use server";

import { createClient } from "@/utils/supabase/server";

export async function resetPassword(formData: FormData, token: string) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return { error: "Jelszó megadása kötelező." };
  }

  if (password !== confirmPassword) {
    return { error: "A két jelszó nem egyezik." };
  }

  if (!token) {
    return { error: "Érvénytelen vagy lejárt jelszó-visszaállító token." };
  }

  try {
    console.log("Attempting to reset password with token");

    const { data: { user }, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery'
    });

    if (verifyError || !user) {
        console.error("Token verification error:", verifyError);
        return { error: "Érvénytelen vagy lejárt jelszó-visszaállító token." };
    }
    
    const { error } = await supabase.auth.updateUser({
      password: password
    }, {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://foxhabits.com'}/login`
    });
    
    if (error) {
      console.error("Password reset error:", error);
      return { error: "Hiba történt a jelszó módosítása során." };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in resetPassword:", error);
    return { error: "Váratlan hiba történt. Kérjük próbálja újra később." };
  }
}
