import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// /api/habits/own ~ A felhasználó saját szokásainak a visszaadása
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Hiányzó autentikációs token" },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (userError || !user) {
      return NextResponse.json(
        { error: "Érvénytelen vagy lejárt token" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("habits")
      .select(
        `
        habit_id, 
        habit_type, 
        interval, 
        habit_interval_type, 
        start_date, 
        is_active, 
        habit_names!inner(habit_name),
        created_date
      `
      )
      .eq("related_user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { message: "Nincs egyetlen szokásod sem." },
        { status: 200 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Szerver hiba történt" },
      { status: 500 }
    );
  }
}
