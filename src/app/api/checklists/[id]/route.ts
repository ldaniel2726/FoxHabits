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

// PATCH /api/checklists/[id] ~ Gyorslista módosítása
export async function PATCH(request: Request) {
  try {
    const statusEnum = z.enum(["CHECKED", "UNCHECKED"]);

    const checklistSchema = z.object({
      id: z.number().positive().int(),
      user_id: z.string().uuid(),
      name: z.string().min(1).max(255),
      elements: z
        .array(
          z.object({
            description: z.string(),
            status: statusEnum,
          })
        )
        .default([]),
      created_at: z.string().datetime(),
      updated_at: z.string().datetime(),
    });

    const result = checklistSchema.safeParse(await request.json());

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const validatedData = result.data;

    const url = new URL(request.url);
    const checklist_id = url.pathname.split("/").pop();

    if (!checklist_id || isNaN(Number(checklist_id))) {
      return NextResponse.json(
        { error: "Érvénytelen szokás azonosító!" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

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

    // Ellenőrizzük a felhasználói jogosultságokat
    const isAdmin = user.user_metadata?.role === ADMIN;
    const updated_related_user_id = isAdmin ? validatedData.user_id : user.id;

    const { data: checklistData, error: checklistError } = await supabase
      .from("checklists")
      .select("related_user_id")
      .eq("id", checklist_id)
      .single();

    if (checklistError) {
      return NextResponse.json(
        { error: checklistError.message },
        { status: 500 }
      );
    }

    if (!checklistData || checklistData.related_user_id !== user.id) {
      return NextResponse.json(
        { error: "Nincs jogosultságod a szokás módosításához." },
        { status: 403 }
      );
    }

    const updates: {
      name?: string;
      elements?: typeof validatedData.elements;
    } = {};

    if (validatedData.name) updates.name = validatedData.name;
    if (validatedData.elements) updates.elements = validatedData.elements;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Nincs frissítendő mező." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("checklists")
      .update(updates)
      .eq("id", checklist_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: `Hibás kérés vagy szerverhiba: ${err}` },
      { status: 500 }
    );
  }
}
