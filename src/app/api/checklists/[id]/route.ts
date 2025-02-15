import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { permissionDeniedReturn } from "@/utils/validators/APIValidators";
import { ADMIN, MODERATOR } from "@/utils/validators/APIConstants";

// GET /api/checklist/[id] ~ Egy adott lista lekérése
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const checklist_id = url.pathname.split("/").pop();

    if (!checklist_id) {
      return NextResponse.json(
        { error: "A szokás azonosítója nem található!" },
        { status: 400 }
      );
    }
    if (isNaN(Number(checklist_id))) {
      return NextResponse.json(
        { error: "A szokás azonosítónak számnak kell lennie!" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log("Auth debug:", { user, userError });

    if (userError || !user) {
      return NextResponse.json(
        { error: "A felhasználó nem található! Kérlek jelentkezz be." },
        { status: 401 }
      );
    }

    const userRole = user.user_metadata?.role;
    console.log("User role:", userRole);

    let query = supabase
      .from("checklists")
      .select(
        `
                user_id,
                name,
                elements,
                created_at,
                updated_at
                `
      )
      .eq("id", checklist_id);

    if (userRole !== ADMIN) {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query;
    console.log("Query debug:", { data, error });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          error:
            "A szokás nem létezik, vagy nincs jogosultságod a megtekintéséhez.",
        },
        { status: 404 }
      );
    }

    const checklistData = Array.isArray(data) ? data[0] : data;
    return NextResponse.json({ data: checklistData }, { status: 200 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Szerver hiba történt!" },
      { status: 500 }
    );
  }
}
