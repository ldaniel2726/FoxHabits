import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET /api/habits/[id] ~ A szokás adatainak visszaadása
export async function GET({ params }: { params: { id: string } }) {
    const supabase = await createClient();

    const { id: habit_id } = params;

    // Felhasználó lekérdezése
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json(
            { error: "Nem vagy bejelentkezve." },
            { status: 401 }
        );
    }

    // Lekérdezés előkészítése
    let query = supabase
        .from('habits')
        .select(
            `
            habit_id, 
            related_user_id, 
            habit_type, 
            interval, 
            habit_interval_type, 
            start_date, 
            is_active, 
            habit_names!inner(habit_name)
        `
        )
        .eq('habit_id', habit_id);

    // Ha a felhasználó nem admin, csak a saját szokását kérdezheti le
    if (user.user_metadata?.role !== 'admin') {
        query = query.eq('related_user_id', user.id);
    }

    const { data: habit, error: habitError } = await query.single();

    if (habitError) {
        return NextResponse.json(
            { error: 'A szokás nem létezik, vagy nincs jogosultságod a megtekintéséhez.' },
            { status: 404 }
        );
    }

    return NextResponse.json(habit, { status: 200 });
}


// PATCH /api/habits/{id} ~ A szokás adatainak módosítása
// export async function PATCH(request: Request, { params }: { params: { id: string } }) {
//     const supabase = await createClient();

//     const { id: habit_id } = params;

//     const habitData = await request.json();

//     const {
//         data: { user },
//         error: userError,
//     } = await supabase.auth.getUser();

//     if (userError || !user) {
//         return NextResponse.json(
//             { error: 'A felhasználó nem található! Kérlek jelentkezz be.' },
//             { status: 401 }
//         );
//     }

//     const { data: habit, error: habitError } = await supabase
//         .from('habits')
//         .update(habitData)
//         .eq('habit_id', habit_id)
//         .eq('related_user_id', user.id)
//         .single();

//     if (habitError) {
//         return NextResponse.json({ error: habitError.message }, { status: 500 });
//     }

//     return NextResponse.json(habit);
// }
