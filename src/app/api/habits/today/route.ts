import { NextResponse } from "next/server";
import { getTodayHabits } from "@/app/habits/today/actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const result = await getTodayHabits(dateParam);
  return NextResponse.json(result);
}
