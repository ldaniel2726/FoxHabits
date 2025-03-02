"use client";

import {
  CalendarDays,
  CheckCircle,
  Clock,
  Repeat,
  Calendar,
  CheckIcon,
  ForwardIcon,
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
import { Button } from "./ui/button";
import { useState } from "react";

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
  const [isHidden, setIsHidden] = useState(false);
  
  const translations: { [key: string]: string } = {
    hours: "órában",
    days: "nap",
    weeks: "héten",
    months: "hónapban",
    years: "évben",
  };

  const handleSkip = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      console.log("Skipping habit:", habit_id);
      const response = await fetch(`/api/entries/habit/${habit_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          habit_id: Number(habit_id),
          time_of_entry: new Date().toISOString(),
          entry_type: "skipped"
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error("Error response:", responseData);
        throw new Error(responseData.error || "Network response was not ok");
      }

      console.log("Szokás kihagyva:", responseData);
      // Hide the card after successful skip
      setIsHidden(true);
    } catch (error) {
      console.error("Error skipping habit:", error);
    }
  };

  const handleComplete = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      console.log("Completing habit:", habit_id);
      const response = await fetch(`/api/entries/habit/${habit_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          habit_id: Number(habit_id),
          time_of_entry: new Date().toISOString(),
          entry_type: "done"
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error("Error response:", responseData);
        throw new Error(responseData.error || "Network response was not ok");
      }

      console.log("Szokás teljesítve:", responseData);
      // Hide the card after successful completion
      setIsHidden(true);
    } catch (error) {
      console.error("Error completing habit:", error);
    }
  };

  // If the habit is hidden (completed or skipped), don't render anything
  if (isHidden) {
    return null;
  }

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
        <CardFooter className="text-sm text-muted-foreground flex justify-between">
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-4 w-4" />
            <span>
              Létrehozva: {format(new Date(created_date), "yyyy MMMM d.")}
            </span>
          </div>
          <div className="flex items-center space-x-2 ml-auto">
            <Button variant="outline" onClick={handleSkip}>
              <ForwardIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleComplete}>
              <CheckIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}