import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// (admin auth hiányzik)

// Minden szokás visszaadása
export async function GET() {
    const supabase = await createClient(); 
    const { data, error } = await supabase.from('habits').select('*');
  
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  
    return NextResponse.json(data);
}

// Új szokás hozzáadása
// export async function POST(request: Request) {
//     const supabase = await createClient();
//     const { 
//         habit_name, 
//         habit_type, 
//         interval, 
//         habit_interval_type,
//         start_date = new Date().toISOString()
//      } = await request.json();
  
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

//       const { data: habitNameData, error: habitNameError } = await supabase
//         .from('habit_names')
//         .select('id')
//         .eq('name', habit_name)
//         .single(); 
  
//       let habitNameId = habitNameData?.id;
  
//       if (!habitNameId) {
//         const { data: newHabitName, error: insertHabitNameError } = await supabase
//           .from('habit_names')
//           .insert([{ 
//             name: habit_name,
//             habit_name_status: 'new'
//          }])
//           .select('id')
//           .single();
  
//         if (insertHabitNameError) {
//           throw new Error('Hiba a szokásnév rögzítése közben: ' + insertHabitNameError.message);
//         }
  
//         habitNameId = newHabitName.id;
//       }
  
//       const { data: newHabit, error: insertHabitError } = await supabase
//         .from('habits')
//         .insert([
//           {
//             user_id: user.id,
//             habit_name_id: habitNameId,
//             habit_type,
//             interval,
//             habit_interval_type,
//             start_date,
//           },
//         ])
//         .select()
//         .single();
  
//       if (insertHabitError) {
//         throw new Error('Hiba a szokás rögzítése közben: ' + insertHabitError.message);
//       }
  
//       return NextResponse.json(newHabit, { status: 201 });
//     } catch (error: unknown) {
//         const errorMessage = error instanceof Error ? error.message : 'Ismeretlen hiba történt';
//         return NextResponse.json({ error: errorMessage }, { status: 500 });
//       }      
//   }
  