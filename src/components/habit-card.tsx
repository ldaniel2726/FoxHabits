import {
  CalendarDays,
  CheckCircle,
  Clock,
  Repeat,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface HabitCardProps {
  habit_id: string;
  habit_type: string;
  interval: number;
  habit_interval_type: string;
  start_date: string;
  is_active: boolean;
  created_date: string;
  habit_name_id: string;
}

export function HabitCard({
  habit_id,
  habit_type,
  interval,
  habit_interval_type,
  start_date,
  is_active,
  created_date,
  habit_name_id,
}: HabitCardProps & { habit_id: string }) {
  const translations: { [key: string]: string } = {
    hours: "órában",
    days: "nap",
    weeks: "héten",
    months: "hónapban",
    years: "évben",
  };

  return (
    <Link href={`/habits/${habit_id}`}>
      <Card className="w-full transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between capitalize text-xl">
            {habit_name_id}
            <Badge variant={is_active ? "default" : "secondary"}>
              {is_active ? "Aktív" : "Inaktív"}
            </Badge>
          </CardTitle>
          <CardDescription>
            {habit_type === "normal_habit"
              ? "Szokás"
              : habit_type === "bad_habit"
              ? "Káros szokás"
              : habit_type}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-2">
            <Repeat className="h-4 w-4 text-muted-foreground" />
            <span>
              Minden {interval !== 1 && `${interval + "."} `}{" "}
              {translations[habit_interval_type] || habit_interval_type}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              Elkezdve: {format(new Date(start_date), "yyyy MMMM d.")}
            </span>
          </div>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-4 w-4" />
            <span>
              Létrehozva: {format(new Date(created_date), "yyyy MMMM d.")}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
