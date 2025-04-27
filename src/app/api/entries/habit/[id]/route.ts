import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { permissionDeniedReturn } from "@/utils/validators/APIValidators";
import { ADMIN, MODERATOR } from "@/utils/validators/APIConstants";

// GET /api/entries/habit/[id] ~ Egy szokáshoz tartozó bejegyzések lekérdezése
export async function GET(request: Request) {
  const url = new URL(request.url);
  const habit_id = url.pathname.split("/").pop();

  if (!habit_id) {
    return NextResponse.json(
      { error: "A szokás azonosítója nem található!" },
      { status: 400 }
    );
  }

  if (isNaN(Number(habit_id))) {
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

  if (userError || !user) {
    return NextResponse.json(
      { error: "A felhasználó nem található! Kérlek jelentkezz be." },
      { status: 401 }
    );
  }

  const role = user.user_metadata?.role;

  if (role === ADMIN) {
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .eq("habit_id", habit_id);

    if (error) {
      return NextResponse.json(
        { error: "Hiba történt az admin lekérdezés során." },
        { status: 500 }
      );
    }
  } else {
    const { data: habitData, error: habitError } = await supabase
      .from("habits")
      .select("*")
      .eq("habit_id", habit_id)
      .eq("related_user_id", user.id)
      .single();

    if (habitError || !habitData) {
      return NextResponse.json(
        { error: "A szokás nem található vagy nem tartozik hozzád!" },
        { status: 403 }
      );
    }
  }

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("habit_id", habit_id);

  if (error) {
    return NextResponse.json(
      { error: "Hiba történt a szokás lekérdezése közben." },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

// POST /api/entries/habit/[id] ~ Egy szokás logolása
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const habit_id = url.pathname.split("/").pop();

    if (!habit_id) {
      return NextResponse.json(
        { error: "A szokás azonosítója nem található!" },
        { status: 400 }
      );
    }

    if (isNaN(Number(habit_id))) {
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

    if (userError || !user) {
      return NextResponse.json(
        { error: "A felhasználó nem található! Kérlek jelentkezz be." },
        { status: 401 }
      );
    }

    const role = user.user_metadata?.role;

    // Check if the habit belongs to the user (unless admin)
    if (role !== ADMIN) {
      const { data: habitData, error: habitError } = await supabase
        .from("habits")
        .select("*")
        .eq("habit_id", habit_id)
        .eq("related_user_id", user.id)
        .single();

      if (habitError || !habitData) {
        return NextResponse.json(
          { error: "A szokás nem található vagy nem tartozik hozzád!" },
          { status: 403 }
        );
      }
    }

    const habit_entry_schema = z.object({
      habit_id: z.number().int().positive(),
      datetime: z
        .string()
        .datetime()
        .optional()
        .default(new Date().toISOString()),
      time_of_entry: z.string().datetime(),
      entry_type: z.enum(["done", "skipped"]).default("done"),
    });

    const requestData = await request.json();
    console.log("Request data:", requestData);

    if (requestData.habit_id && Number(requestData.habit_id) !== Number(habit_id)) {
      return NextResponse.json(
        { error: "A szokás azonosító nem egyezik a kérésben megadott azonosítóval!" },
        { status: 400 }
      );
    }

    if (requestData.habit_id) {
      requestData.habit_id = Number(requestData.habit_id);
    }
    
    const result = habit_entry_schema.safeParse(requestData);
    console.log("Validation result:", result);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const validatedData = {
      ...result.data,
      habit_id: Number(habit_id)
    };

    console.log("Inserting data:", validatedData);
    
    const { data, error } = await supabase
      .from("entries")
      .insert(validatedData)
      .select();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Hiba történt a bejegyzés mentése közben." },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Operation failed:", error);
    return NextResponse.json(
      { error: "Hiba történt a bejegyzés feldolgozása közben." },
      { status: 500 }
    );
  }
}
