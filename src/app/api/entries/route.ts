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

// DELETE /api/entries/[id] ~ Egy bejegyzés törlése

export async function DELETE(request: Request) {
  const supabase = await createClient();

  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json(
      { error: "Bejegyzés azonosítója nem található!" },
      { status: 400 }
    );
  }

  if (isNaN(Number(id))) {
    return NextResponse.json(
      { error: "Bejegyzés azonosítónak számnak kell lennie!" },
      { status: 400 }
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return NextResponse.json(
      { error: "Hiba történt a felhasználó azonosítása közben." },
      { status: 401 }
    );
  }

  const { data: entryData, error: entryError } = await supabase
    .from("entries")
    .select("*")
    .eq("entry_id", id)
    .single();

  if (entryError) {
    return NextResponse.json(
      { error: "Hiba történt a bejegyzés lekérdezése közben." },
      { status: 500 }
    );
  }

  if (!entryData) {
    return NextResponse.json(
      { error: "A bejegyzés nem található!" },
      { status: 404 }
    );
  }

  if (entryData.user_id !== user?.id && user?.role !== ADMIN) {
    return permissionDeniedReturn();
  }

  const { error: deleteError } = await supabase
    .from("entries")
    .delete()
    .eq("entry_id", id);

  if (deleteError) {
    return NextResponse.json(
      { error: "Hiba történt a bejegyzés törlése közben." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
