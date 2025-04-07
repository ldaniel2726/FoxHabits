import { HabitCard } from "@/components/habit-card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Habit } from "@/types/Habit";

export default async function Page() {
  const supabase = await createClient();
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const host = process.env.VERCEL_URL || "localhost:3000";
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const response = await fetch(`${protocol}://${host}/api/habits/own`, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
  });
  const result = await response.json();

  if (result.message) {
    return (
      <div className="px-4 md:px-14 py-10">
        <div className="flex items-end justify-between">
          <h1 className="text-4xl font-bold pt-12">Összes szokásod</h1>
          <Link href="/habits/add">
            <Button>Szokás hozzáadása</Button>
          </Link>
        </div>
        <p className="text-lg pb-6 text-zinc-600">
          {result.message}
        </p>
      </div>
    );
  } else if (result.error) {
    return (
      <div className="px-4 md:px-14 py-10">
        <div className="flex items-end justify-between">
          <h1 className="text-4xl font-bold pt-12">Összes szokásod</h1>
          <Link href="/habits/add">
            <Button>Szokás hozzáadása</Button>
          </Link>
        </div>
        <p className="text-lg pb-6 text-zinc-600">
          {result.error}
        </p>
      </div>
    );
  }

  const habits = result as Habit[];
  return (
    <div className="px-4 md:px-14 py-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between">
        <h1 className="text-4xl font-bold pt-12">Összes szokásod</h1>
        <Link href="/habits/add" className="py-4 md:py-0">
          <Button>Szokás hozzáadása</Button>
        </Link>
      </div>
      <p className="text-lg pb-6 text-zinc-600">
        {habits?.length || 0} szokás található
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
        {habits?.map((habit: Habit) => (
          <HabitCard
            key={habit.habit_id}
            habit_id={habit.habit_id}
            habit_type={habit.habit_type}
            interval={habit.interval}
            habit_interval_type={habit.habit_interval_type}
            start_date={habit.start_date}
            is_active={habit.is_active}
            created_date={habit.created_date}
            habit_name_id={habit.habit_names.habit_name}
          />
        ))}
      </div>
    </div>
  );
}
