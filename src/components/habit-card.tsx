"use client";

import {
  CalendarDays,
  CheckCircle,
  Clock,
  Repeat,
  Calendar,
  CheckIcon,
  ForwardIcon,
  XIcon,
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
  const [status, setStatus] = useState<{ type: null | "done" | "skipped", time: string | null }>({
    type: null,
    time: null
  });
  const [entryId, setEntryId] = useState<string | null>(null);
  
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
      // Update status instead of hiding
      setStatus({
        type: "skipped",
        time: new Date().toISOString()
      });
      // Store the entry ID for potential undo
      if (responseData.data && responseData.data[0]) {
        setEntryId(responseData.data[0].entry_id);
      }
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
      // Update status instead of hiding
      setStatus({
        type: "done",
        time: new Date().toISOString()
      });
      // Store the entry ID for potential undo
      if (responseData.data && responseData.data[0]) {
        setEntryId(responseData.data[0].entry_id);
      }
    } catch (error) {
      console.error("Error completing habit:", error);
    }
  };

  const handleUndo = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!entryId) return;
    
    try {
      console.log("Undoing habit entry:", entryId);
      const response = await fetch(`/api/entries/${entryId}`, {
        method: "DELETE",
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error("Error response:", responseData);
        throw new Error(responseData.error || "Network response was not ok");
      }

      console.log("Szokás visszavonva:", responseData);
      // Reset status
      setStatus({
        type: null,
        time: null
      });
      setEntryId(null);
    } catch (error) {
      console.error("Error undoing habit entry:", error);
    }
  };

  // Define card style based on status
  const cardStyle = status.type 
    ? "w-full transition-all opacity-70 order-last" 
    : "w-full transition-all hover:shadow-lg";

  return (
    <Link href={`/habits/${habit_id}`}>
      <Card className={cardStyle}>
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
          {status.type && status.time && (
            <div className="flex items-center space-x-2 mt-2 font-medium">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <span>
                {status.type === "done" ? "Elvégezve" : "Kihagyva"}: {format(new Date(status.time), "yyyy MMMM d. HH:mm")}
              </span>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground flex justify-between">
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-4 w-4" />
            <span>
              Létrehozva: {format(new Date(created_date), "yyyy MMMM d.")}
            </span>
          </div>
          <div className="flex items-center space-x-2 ml-auto">
            {status.type ? (
              <Button variant="outline" onClick={handleUndo}>
                <XIcon className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleSkip}>
                  <ForwardIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={handleComplete}>
                  <CheckIcon className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}