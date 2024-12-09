import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { badContentReturn, numberValidator, permissionDeniedReturn, selectValidator, stringValidator } from "@/utils/validators/APIValidators";
import { getValidHabitNameStatuses } from "@/utils/validators/HabitValidators";
import { z } from "zod";

// GET /api/habits ~ Az összes szokás visszaadása admin felhasználóknak
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

  const role = user.user_metadata?.role;

  if (role !== "admin") {
    return permissionDeniedReturn();
  }

  const { data, error } = await supabase
    .from("habits")
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
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

// POST /api/habits ~ Szokás létrehozása
export async function POST(request: Request) {  
  try {
      const {
          habit_name,
          habit_name_status = 'new',
          habit_type,
          interval,
          habit_interval_type,
          start_date = new Date().toISOString(),
          is_active = true,
      } = await request.json();

      const supabase = await createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
          return NextResponse.json(
              { error: 'A felhasználó nem található! Kérlek jelentkezz be.' },
              { status: 401 }
          );
      }

      const role = user.user_metadata?.role;

      const validHabitTypes = ['normal_habit', 'bad_habit'];
      const validHabitIntervalTypes = ['hours', 'days', 'weeks', 'months', 'years'];
      const validHabitNameStatus = getValidHabitNameStatuses(role);
      
      if (!stringValidator(255, habit_name)) {
          return badContentReturn("A szokás neve nem megfelelő.");
      }

      if(!stringValidator) return badContentReturn("A szokás nevének státusza nem megfelelő.");

      if (!selectValidator) return badContentReturn(`A szokás nevének státusza csak ${validHabitNameStatus.join(', ')} lehet.`);


      if (typeof interval !== 'number' || interval <= 0) {
          return NextResponse.json({ error: 'Az intervallum kötelező, és pozitív számnak kell lennie.' }, { status: 400 });
      }

      if (!validHabitIntervalTypes.includes(habit_interval_type)) {
          return NextResponse.json({ error: `Az intervallum típusa csak ${validHabitIntervalTypes.join(', ')} lehet.` }, { status: 400 });
      }

      if (isNaN(Date.parse(start_date))) {
          return NextResponse.json({ error: 'A kezdési dátum érvénytelen.' }, { status: 400 });
      }

      if (typeof is_active !== 'boolean') {
          return NextResponse.json({ error: 'Az aktivitás státusza boolean típusú kell legyen.' }, { status: 400 });
      }



      let habit_name_id;

      const { data: habitNameData, error: habitNameError } = await supabase
          .from('habit_names')
          .select('habit_name_id')
          .eq('habit_name', habit_name)
          .single();

      if (habitNameError && habitNameError.code !== 'PGRST116') {
          return NextResponse.json({ error: habitNameError.message }, { status: 500 });
      }

      if (!habitNameData) {
          const { data: newHabitNameData, error: newHabitNameError } = await supabase
              .from('habit_names')
              .insert([
                  { 
                      habit_name,
                      habit_name_status,
                      sender_user_id: user.id,
                  }
              ])
              .select('habit_name_id')
              .single();

          if (newHabitNameError) {
              return NextResponse.json({ error: newHabitNameError.message }, { status: 500 });
          }

          habit_name_id = newHabitNameData.habit_name_id;
      } else {
          habit_name_id = habitNameData.habit_name_id;
      }


      const { data, error } = await supabase
          .from('habits')
          .insert([
              {
                  related_user_id: user.id,
                  habit_type,
                  interval,
                  habit_interval_type,
                  start_date,
                  is_active,
                  habit_name_id,
              }
          ])
          .select('habit_id')
          .single();

      if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: `Hibás kérés vagy szerverhiba` }, { status: 500 });
}
}