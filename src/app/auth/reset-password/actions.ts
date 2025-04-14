"use server"

import { createClient } from "@/utils/supabase/server";

const supabase = await createClient();

export async function resetPassword(password: string) {
    const updateResult = await supabase.auth.updateUser({ 
        password: password,
    }, {
        emailRedirectTo: window.location.origin
    });

    if (updateResult.error) {
        console.log("Password reset error:", updateResult.error)
    }
}
