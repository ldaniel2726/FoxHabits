import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// (admin auth hiányzik)

// GET /api/habits ~ Az összes szokás visszaadása
export async function GET() {
    const supabase = await createClient(); 
    const { data, error } = await supabase.from('habits').select('*');
  
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  
    return NextResponse.json(data);
}


// // Új szokás hozzáadása
// export async function POST(request: Request) {
//     const supabase = await createClient();
//     const { 
//         habit_name, 
//         habit_type, 
//         interval, 
//         habit_interval_type,
//         start_date = new Date().toISOString(),
//         is_active = true // Alapértelmezett aktív szokás
//     } = await request.json();
  
//     const {
//       data: { user },
//       error: userError,
//     } = await supabase.auth.getUser();
  
//     if (userError || !user) {
//       return NextResponse.json(
//         { error: 'A felhasználó nem található! Kérlek jelentkezz be.' },
//         { status: 401 }
//       );
//     }
  
//     try {
//       // Habit_name_id kezelése
//       const { data: habitNameData, error: habitNameError } = await supabase
//         .from('habit_names')
//         .select('habit_name_id')
//         .eq('habit_name', habit_name)
//         .single(); 
  
//       let habitNameId = habitNameData?.habit_name_id;
  
//       if (!habitNameId) {
//         const { data: newHabitName, error: insertHabitNameError } = await supabase
//           .from('habit_names')
//           .insert([{ 
//             habit_name: habit_name,
//             habit_name_status: 'new',
//             sender_user_id: user.id, // Felvitel a jelenlegi felhasználótól
//          }])
//           .select('habit_name_id')
//           .single();
  
//         if (insertHabitNameError) {
//           throw new Error('Hiba a szokásnév rögzítése közben: ' + insertHabitNameError.message);
//         }
  
//         habitNameId = newHabitName.habit_name_id;
//       }
  
//       // Szokás rögzítése
//       const { data: newHabit, error: insertHabitError } = await supabase
//         .from('habits')
//         .insert([{
//           related_user_id: user.id,
//           habit_name_id: habitNameId,
//           habit_type,
//           interval,
//           habit_interval_type,
//           start_date,
//           is_active,
//         }])
//         .select()
//         .single();
  
//       if (insertHabitError) {
//         throw new Error('Hiba a szokás rögzítése közben: ' + insertHabitError.message);
//       }
  
//       return NextResponse.json(newHabit, { status: 201 });
//     } catch (error: unknown) {
//       const errorMessage = error instanceof Error ? error.message : 'Ismeretlen hiba történt';
//       return NextResponse.json({ error: errorMessage }, { status: 500 });
//     }
// }


// // Szokás módosítása
// export async function PATCH(request: Request) {
//     const supabase = await createClient();
//     const { habit_id, ...habitData } = await request.json();
  
//     const {
//       data: { user },
//       error: userError,
//     } = await supabase.auth.getUser();
  
//     if (userError || !user) {
//       return NextResponse.json(
//         { error: 'A felhasználó nem található! Kérlek jelentkezz be.' },
//         { status: 401 }
//       );
//     }
  
//     const { data: habit, error: habitError } = await supabase
//       .from('habits')
//       .update(habitData)
//       .eq('habit_id', habit_id)
//       .eq('related_user_id', user.id)
//       .single();
  
//     if (habitError) {
//       return NextResponse.json({ error: habitError.message }, { status: 500 });
//     }
  
//     return NextResponse.json(habit);
// }
