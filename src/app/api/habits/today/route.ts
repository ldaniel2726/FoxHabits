import { NextResponse } from "next/server";
import { getTodayHabits } from "@/app/habits/today/actions";

export async function GET() {
  const result = await getTodayHabits();
  return NextResponse.json(result);
}
