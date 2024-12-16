import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { badContentReturn, permissionDeniedReturn } from "@/utils/validators/APIValidators";
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
      const habitSchema = z.object({
          habit_name: z.string().min(1).max(255),
          habit_name_status: z.string().default('new'),
          habit_type: z.enum(['normal_habit', 'bad_habit']),
          interval: z.number().positive(),
          habit_interval_type: z.enum(['hours', 'days', 'weeks', 'months', 'years']),
          start_date: z.string().datetime().default(() => new Date().toISOString()),
          is_active: z.boolean().default(true),
      });

      const result = habitSchema.safeParse(await request.json());
      
      if (!result.success) {
          return NextResponse.json(
              { error: result.error.issues[0].message },
              { status: 400 }
          );
      }

      const validatedData = result.data;
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
      const validHabitNameStatus = getValidHabitNameStatuses(role);

      // Ellenőrizzük a habit_name_status értékét a szerepkör alapján
      if (!validHabitNameStatus.includes(validatedData.habit_name_status)) {
          return NextResponse.json(
              { error: `A szokás nevének státusza csak ${validHabitNameStatus.join(', ')} lehet.` },
              { status: 400 }
          );
      }

      let habit_name_id;

      const { data: habitNameData, error: habitNameError } = await supabase
          .from('habit_names')
          .select('habit_name_id')
          .eq('habit_name', validatedData.habit_name)
          .single();

      if (habitNameError && habitNameError.code !== 'PGRST116') {
          return NextResponse.json({ error: habitNameError.message }, { status: 500 });
      }

      if (!habitNameData) {
          const { data: newHabitNameData, error: newHabitNameError } = await supabase
              .from('habit_names')
              .insert([
                  { 
                      habit_name: validatedData.habit_name,
                      habit_name_status: validatedData.habit_name_status,
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
                  habit_type: validatedData.habit_type,
                  interval: validatedData.interval,
                  habit_interval_type: validatedData.habit_interval_type,
                  start_date: validatedData.start_date,
                  is_active: validatedData.is_active,
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