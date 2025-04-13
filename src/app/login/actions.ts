"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { ExtendedUser } from "@/types/ExtendedUser";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data: signInData, error } = await supabase.auth.signInWithPassword(
    data
  );

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "Kérjük erősítsd meg az email címedet." };
    } else if (error.message?.includes("banned")) {
      return {
        error:
          "A fiókod tiltva van. Kérjük, vedd fel a kapcsolatot az adminisztrátorral.",
      };
    } else {
      return { error: "Hibás email cím vagy jelszó. Próbálja újra." };
    }
  }

  if (signInData?.user) {
    const user = signInData.user as ExtendedUser;
    if (user.banned_until) {
      try {
        const banDate = new Date(user.banned_until);
        if (banDate > new Date()) {
          await supabase.auth.signOut();
          return {
            error:
              "A fiókod tiltva van. Kérjük, vedd fel a kapcsolatot az adminisztrátorral.",
          };
        }
      } catch (error) {
        console.error("Error checking ban status:", error);
      }
    }
  }

  revalidatePath("/", "layout");
  redirect("/profile");
}

export async function loginWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://foxhabits.com/auth/callback",
    },
  });

  if (error) {
    return {
      sucess: false,
      error: "Google bejelentkezés sikertelen. Próbálja újra.",
    };
  } else {
    return { sucess: true, url: data.url };
  }
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email cím megadása kötelező." };
  }

  // Update the redirectTo to point to our callback route which will handle the token
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
  });

  if (error) {
    console.error("Password reset email error:", error);
    return {
      error:
        "Hiba történt a jelszó visszaállítása során. Kérjük próbálja újra.",
    };
  }

  return { success: true };
}
