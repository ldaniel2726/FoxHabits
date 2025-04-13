"use client";

import {
  CalendarDays,
  CheckCircle,
  Repeat,
  Calendar,
  CheckIcon,
  ForwardIcon,
  XCircleIcon,
  BanIcon,
  Undo2,
  FlameIcon,
} from "lucide-react";
import { format, differenceInHours } from "date-fns";
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
import { useState, useEffect, useRef } from "react";
import { DeleteHabitButton } from "./DeleteHabitButton";
import { EditHabitButton } from "./EditHabitButton";
import { HabitCardProps } from "@/types/HabitCardProps";
import { calculateHabitStreak, isHabitCompletedOnDate } from "@/utils/habit-utils";

export function HabitCard({
  habit_id,
  habit_type,
  interval,
  habit_interval_type,
  start_date,
  is_active,
  created_date,
  habit_name_id,
  entries = [],
}: HabitCardProps & { habit_id: number }) {
  const [status, setStatus] = useState<{ type: null | "done" | "skipped", time: string | null }>({
    type: null,
    time: null
  });
  const [entryId, setEntryId] = useState<string | null>(null);
  const [isWithin24Hours, setIsWithin24Hours] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const originalStreakRef = useRef<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false); 

  useEffect(() => {
    const habit = {
      habit_id: habit_id,
      habit_type: habit_type as 'normal_habit' | 'bad_habit',
      habit_interval_type: habit_interval_type as 'days' | 'weeks' | 'months' | 'years',
      interval,
      start_date,
      is_active,
      entries
    };

    const completionInfo = isHabitCompletedOnDate(habit);
    const currentStreak = calculateHabitStreak(habit); 
    originalStreakRef.current = currentStreak;
    
    setStreak(currentStreak); 

    if (completionInfo.isCompleted) {
      const lastEntry = entries.findLast(entry => entry.entry_type === 'done');
      if (lastEntry) {
        const entryDate = new Date(lastEntry.datetime.replace(' ', 'T'));
        const hoursSinceEntry = differenceInHours(new Date(), entryDate);
        
        setIsWithin24Hours(hoursSinceEntry < 24);
        
        setStatus({
          type: 'done',
          time: lastEntry.datetime
        });
        setEntryId(lastEntry.entry_id.toString());
      }
    } else if (completionInfo.isSkipped) {
      const lastEntry = entries.find(entry => entry.entry_type === 'skipped');
      if (lastEntry) {
        setStatus({
          type: 'skipped',
          time: lastEntry.datetime
        });
        setEntryId(lastEntry.entry_id.toString());
      }
    }
  }, [habit_id, habit_type, habit_interval_type, interval, start_date, is_active, entries]);

  const translations: { [key: string]: string } = {
    hours: "órában",
    days: "nap",
    weeks: "héten",
    months: "hónapban",
    years: "évben",
  };

  let timeFromLastLog;

  if (entries.length > 0) {
    const lastEntry = entries[entries.length - 1];
    const lastEntryDate = new Date(lastEntry.datetime.replace(' ', 'T') + 'Z');
    timeFromLastLog = Math.abs(new Date().getTime() - lastEntryDate.getTime());
  } else {
    timeFromLastLog = Math.abs(new Date().getTime() - new Date(start_date).getTime());
  }
  console.log(new Date());

  const handleSkip = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    try {
      console.log("Skipping habit:", habit_id);
      const response = await fetch(`/api/entries/habit/${habit_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          habit_id: habit_id,
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
        setEntryId(responseData.data[0].entry_id.toString());
      }
    } catch (error) {
      console.error("Error skipping habit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true); 
    try {
      console.log("Completing habit:", habit_id);
      const response = await fetch(`/api/entries/habit/${habit_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          habit_id: habit_id,
          time_of_entry: new Date().toISOString(),
          entry_type: "done"
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Error response:", responseData);
        throw new Error(responseData.error || "Network response was not ok");
      }

      const newEntry = responseData.data && responseData.data[0] ? responseData.data[0] : null;
      const updatedEntries = newEntry 
        ? [...entries, newEntry] 
        : entries;
      
      const habit = {
        habit_id,
        habit_type: habit_type as 'normal_habit' | 'bad_habit',
        habit_interval_type: habit_interval_type as 'days' | 'weeks' | 'months' | 'years',
        interval,
        start_date,
        is_active,
        entries: updatedEntries
      };
      
      let newStreak;
      if (habit_type === "bad_habit") {
        newStreak = 0;
      } else {
        newStreak = calculateHabitStreak(habit);
      }
      console.log("New streak after complete:", newStreak);
      setStreak(newStreak);

      if (habit_type === "bad_habit") {
        const timeFromLastLogElement = document.getElementById("time-from-last-log");
        if (timeFromLastLogElement) {
          timeFromLastLogElement.style.display = "none";
        }
        setIsWithin24Hours(true);
      }
      setStatus({
        type: "done",
        time: new Date().toISOString()
      });
      if (newEntry) {
        setEntryId(newEntry.entry_id.toString());
      }
      
      setTimeout(() => {
        const streakElement = document.querySelector(`[data-habit-id="${habit_id}"] .streak-value`);
        if (streakElement) {
          streakElement.textContent = newStreak.toString();
        }
      }, 0);
    } catch (error) {
      console.error("Error completing habit:", error);
    } finally {
      setIsLoading(false); 
    }
  };

  const handleUndo = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!entryId) return;
    setIsLoading(true);

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

      const updatedEntries = entries.filter(entry => entry.entry_id.toString() !== entryId);
      
      let newStreak;
      if (habit_type === "normal_habit") {
        newStreak = Math.max(0, streak - 1);
      } else {
        newStreak = entries.length === 0 ? Math.floor((new Date().getTime() - new Date(start_date).getTime()) / (1000 * 60 * 60 * 24)) : entries.filter(entry => entry.entry_type === 'done').length; 
      }
      
      console.log("New streak after undo:", newStreak);
      setStreak(newStreak);

      if (habit_type === "bad_habit") {
        const timeFromLastLogElement = document.getElementById("time-from-last-log");
        if (timeFromLastLogElement) {
          timeFromLastLogElement.style.display = "flex";
        }
        setIsWithin24Hours(false);
      }

      console.log("Szokás visszavonva:", responseData);
      setStatus({
        type: null,
        time: null
      });
      setEntryId(null);
      

      setTimeout(() => {
        const streakElement = document.querySelector(`[data-habit-id="${habit_id}"] .streak-value`);
        if (streakElement) {
          streakElement.textContent = newStreak.toString();
        }
      }, 0);
    } catch (error) {
      console.error("Error undoing habit entry:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cardStyle = () => {
    let baseStyle = "w-full transition-all";

    if (status.type === "done" && (habit_type !== "bad_habit" || isWithin24Hours)) {
      baseStyle += " opacity-70 order-last";
    } else if (status.type === "skipped") {
      baseStyle += " opacity-70 order-last";
    } else {
      baseStyle += " hover:shadow-lg";
    }

    return baseStyle;
  };

  const getStatusText = () => {
    if (!status.type || !status.time) return "";

    if (habit_type === "bad_habit" && status.type === "done") {
      return isWithin24Hours && "Szokás elbukva";
    } else {
      return status.type === "done"
        ? "Elvégezve"
        : "Kihagyva";
    }
  };

  const StatusIcon = () => {
    if (!status.type) return null;

    if (habit_type === "bad_habit" && status.type === "done" && isWithin24Hours) {
      return <XCircleIcon className="h-4 w-4 text-red-800" />;
    } else if (status.type === "done") {
      return <CheckCircle className="h-4 w-4 text-muted-foreground text-green-800" />;
    } else {
      return <ForwardIcon className="h-4 w-4 text-muted-foreground" />;
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
      <Card className={`${cardStyle()} cursor-pointer p-4 md:p-6`} onClick={handleCardClick} data-habit-id={habit_id}>
        <CardHeader>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="mr-0 md:mr-2 font-bold text-2xl"><h1>{habit_name_id}</h1></div>
            <CardTitle className="flex flex-col md:flex-row items-start md:items-center justify-between capitalize text-lg md:text-xl">
              <div className="flex items-center gap-1 mt-2 md:mt-0" onClick={(e) => e.stopPropagation()}>
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
                <Badge className="ml-1.5 border-orange-700 text-orange-700 font-bold" variant="outline">
                  <FlameIcon className="h-4 w-4" />
                  {habit_type === "normal_habit" ? streak : timeFromLastLog ? Math.floor(timeFromLastLog / (1000 * 60 * 60 * 24)) : 0}{" "}
                </Badge>
              </div>
            </CardTitle>
          </div>
          <CardDescription className={habit_type === "bad_habit" ? "text-orange-700 font-medium" : ""}>
            {habit_type === "normal_habit"
              ? "Szokás"
              : habit_type === "bad_habit"
                ? "Ártó szokás"
                : habit_type}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 md:space-y-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
            <Repeat className="h-4 w-4 text-muted-foreground" />
            <span>
              Minden {interval !== 1 && `${interval + "."} `}{" "}
              {translations[habit_interval_type] || habit_interval_type}
            </span>
          </div>
          {habit_type === "normal_habit" && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Elkezdve: {format(new Date(start_date), "yyyy MMMM d.")}
              </span>
            </div>
          )}

          {status.type && status.time && !(habit_type === "bad_habit" && !isWithin24Hours) && (
            <div className={`flex items-center space-x-2 mt-2 font-medium ${
              habit_type === "bad_habit" && status.type === "done" && isWithin24Hours 
                ? "text-red-600" 
                : status.type === "done" 
                  ? "text-green-600" 
                  : "text-muted-foreground"
            }`}>
              <StatusIcon />
              <span>
                {getStatusText()}: {format(new Date(status.time), "yyyy MMMM d. HH:mm")}
              </span>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center space-x-2 mb-2 md:mb-0">
            <CalendarDays className="h-4 w-4" />
            <span>
              Létrehozva: {format(new Date(created_date), "yyyy MMMM d.")}
            </span>
          </div>
          <div className="flex items-center space-x-2 ml-auto" onClick={(e) => e.stopPropagation()}>
            {(status.type && !(habit_type === "bad_habit" && status.type === "done" && !isWithin24Hours)) ? (
              <Button variant="outline" onClick={handleUndo} disabled={isLoading}>
                <Undo2 className="h-4 w-4" />
              </Button>
            ) : (
              <>
                {habit_type !== "bad_habit" && (
                  <Button variant="outline" onClick={handleSkip} disabled={isLoading}>
                    <ForwardIcon className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="outline" onClick={handleComplete} disabled={isLoading}>
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