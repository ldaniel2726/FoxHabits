import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { permissionDeniedReturn } from "@/utils/validators/APIValidators";
import { ADMIN } from "@/utils/validators/APIConstants";

// GET /api/entries ~ Az összes bejegyzés lekérdezése
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("entries").select("*");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "A felhasználó nem található! Kérlek jelentkezz be." },
      { status: 401 }
    );
  }

  if (error) {
    return NextResponse.json(
      { error: "Hiba történt a bejegyzések lekérdezése közben." },
      { status: 500 }
    );
  }

  const role = user.user_metadata?.role;

  if (role !== ADMIN) {
    return permissionDeniedReturn();
  }

  return NextResponse.json(data);
}
