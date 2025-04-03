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
  XCircleIcon,
  BanIcon,
  Undo2,
  MoreVertical,
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
import { Button } from "./ui/button";
import { useState } from "react";
import { DeleteHabitButton } from "./DeleteHabitButton";
import { EditHabitButton } from "./EditHabitButton";
import { HabitCardProps } from "@/types/HabitCardProps";

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
    e.stopPropagation();
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
      setStatus({
        type: "skipped",
        time: new Date().toISOString()
      });
      if (responseData.data && responseData.data[0]) {
        setEntryId(responseData.data[0].entry_id);
      }
    } catch (error) {
      console.error("Error skipping habit:", error);
    }
  };

  const handleComplete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      setStatus({
        type: "done",
        time: new Date().toISOString()
      });
      if (responseData.data && responseData.data[0]) {
        setEntryId(responseData.data[0].entry_id);
      }
    } catch (error) {
      console.error("Error completing habit:", error);
    }
  };

  const handleUndo = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      setStatus({
        type: null,
        time: null
      });
      setEntryId(null);
    } catch (error) {
      console.error("Error undoing habit entry:", error);
    }
  };

  const cardStyle = () => {
    let baseStyle = "w-full transition-all";
    
    if (status.type) {
      baseStyle += " opacity-70 order-last";
    } else {
      baseStyle += " hover:shadow-lg";
    }
    
    
    return baseStyle;
  };

  const getStatusText = () => {
    if (!status.type || !status.time) return "";
    
    if (habit_type === "bad_habit") {
      return status.type === "done" 
        ? "Szokás elbukva" 
        : "Kihagyva";
    } else {
      return status.type === "done" 
        ? "Elvégezve" 
        : "Kihagyva";
    }
  };

  const StatusIcon = () => {
    if (!status.type) return null;
    
    if (habit_type === "bad_habit" && status.type === "done") {
      return <XCircleIcon className="h-4 w-4 text-muted-foreground" />;
    } else {
      return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const CompleteButtonIcon = () => {
    if (habit_type === "bad_habit") {
      return <BanIcon className="h-4 w-4" />;
    } else {
      return <CheckIcon className="h-4 w-4" />;
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isButton = target.closest('button');
    
    if (!isButton) {
      window.location.href = `/habits/${habit_id}`;
    }
  };

  return (
    <div>
      <Card className={`${cardStyle()} cursor-pointer`} onClick={handleCardClick}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between capitalize text-xl">
            <div className="truncate mr-2">{habit_name_id}</div>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <EditHabitButton habitId={habit_id} />
              <DeleteHabitButton 
                habitId={habit_id} 
                onDelete={() => {
                  window.location.reload();
                }} 
              />
              <Badge className="ml-1.5" variant={is_active ? "default" : "secondary"}>
                {is_active ? "Aktív" : "Inaktív"}
              </Badge>
            </div>
          </CardTitle>
          <CardDescription className={habit_type === "bad_habit" ? "text-orange-700 font-medium" : ""}>
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
              <StatusIcon />
              <span>
                {getStatusText()}: {format(new Date(status.time), "yyyy MMMM d. HH:mm")}
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
          <div className="flex items-center space-x-2 ml-auto" onClick={(e) => e.stopPropagation()}>
            {status.type ? (
              <Button variant="outline" onClick={handleUndo}>
                <Undo2 className="h-4 w-4" />
              </Button>
            ) : (
              <>
                {habit_type !== "bad_habit" && (
                  <Button variant="outline" onClick={handleSkip}>
                    <ForwardIcon className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="outline" onClick={handleComplete}>
                  <CompleteButtonIcon />
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
