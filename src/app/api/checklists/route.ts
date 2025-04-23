import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

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

  const { data, error } = await supabase
    .from("checklists")
    .select(
      `
        id,
        user_id,
        name,
        elements,
        created_at,
        updated_at
      `
    )
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const StatusEnum = z.enum(["CHECKED", "UNCHECKED"]);

    const checklistSchema = z.object({
      name: z.string().min(1).max(255),
      elements: z
        .array(
          z.object({
            description: z.string(),
            status: StatusEnum,
          })
        )
        .default([]),
    });

    const result = checklistSchema.safeParse(await request.json());

    if (!result.success) {
      console.log(result.error);
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
        { error: "A felhasználó nem található! Kérlek jelentkezz be." },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("checklists")
      .insert({
        user_id: user.id,
        name: validatedData.name,
        elements: validatedData.elements,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: `Hibás kérés vagy szerverhiba` },
      { status: 500 }
    );
  }
}
