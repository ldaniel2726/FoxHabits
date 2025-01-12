import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, Clock, Repeat, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default async function HabitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const host = process.env.VERCEL_URL || "localhost:3000";
  const response = await fetch(
    `${protocol}://${host}/api/habits/${(await params).id}`
  );
  const result = await response.json();

  if (result.error) {
    notFound();
  }

  const habit = result.data;

  if (!habit) {
    notFound();
  }

  const translations: { [key: string]: string } = {
    hours: "órában",
    days: "nap",
    weeks: "héten",
    months: "hónapban",
    years: "évben",
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl capitalize">
                {habit.habit_names.habit_name}
              </CardTitle>
              <CardDescription className="mt-2">
                {habit.habit_type === "normal_habit"
                  ? "Normál szokás"
                  : habit.habit_type === "bad_habit"
                  ? "Káros szokás"
                  : habit.habit_type}
              </CardDescription>
            </div>
            <Badge variant={habit.is_active ? "default" : "secondary"}>
              {habit.is_active ? "Aktív" : "Inaktív"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg">
                Minden {habit.interval !== 1 && `${habit.interval + "."} `}
                {translations[habit.habit_interval_type] ||
                  habit.habit_interval_type}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg">
                Elkezdve: {format(new Date(habit.start_date), "yyyy MMMM d.")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg">
                Létrehozva:{" "}
                {format(new Date(habit.created_date), "yyyy MMMM d.")}
              </span>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Statisztikák</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* TODO: Add statistics */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
