import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';


// /api/habits/own ~ A felhasználó saját szokásainak a visszaadása
export async function GET() {
  const supabase = await createClient();

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

  const userid = user.id;


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
      habit_names!inner(habit_name)
    `
    )
    .eq('related_user_id', userid);

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
}