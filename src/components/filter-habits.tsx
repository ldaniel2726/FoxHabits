"use client";

import { useState } from "react";
import { HabitCard } from "@/components/habit-card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Habit } from "@/types/Habit";
import { Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HabitsWithFiltersProps {
  habits: Habit[];
}

export function HabitsWithFilters({ habits }: HabitsWithFiltersProps) {
  const [activeFilter, setActiveFilter] = useState("all"); // all, active, inactive
  const [typeFilter, setTypeFilter] = useState("all"); // all, good, bad

  const filteredHabits = habits.filter((habit) => {
    // Filter by active status
    if (activeFilter === "active" && !habit.is_active) return false;
    if (activeFilter === "inactive" && habit.is_active) return false;

    // Filter by habit type
    if (typeFilter === "good" && habit.habit_type !== "normal_habit") return false;
    if (typeFilter === "bad" && habit.habit_type !== "bad_habit") return false;

    return true;
  });

  return (
    <div className="px-4 md:px-14 py-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between">
        <h1 className="text-4xl font-bold pt-12">Összes szokásod</h1>
        <div className="flex gap-2 py-4 md:py-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Szűrési lehetőségek</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Állapot szerint</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={activeFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter("all")}
                    >
                      Összes
                    </Button>
                    <Button 
                      variant={activeFilter === "active" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter("active")}
                    >
                      Aktív
                    </Button>
                    <Button 
                      variant={activeFilter === "inactive" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter("inactive")}
                    >
                      Inaktív
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Típus szerint</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant={typeFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTypeFilter("all")}
                    >
                      Összes
                    </Button>
                    <Button 
                      variant={typeFilter === "good" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTypeFilter("good")}
                    >
                      Hasznos
                    </Button>
                    <Button 
                      variant={typeFilter === "bad" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTypeFilter("bad")}
                    >
                      Ártó
                    </Button>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/habits/add">
            <Button>Szokás hozzáadása</Button>
          </Link>
        </div>
      </div>
      
      <p className="text-lg pb-6 text-zinc-600">
        {filteredHabits.length} szokás található
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
        {filteredHabits.map((habit) => (
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
            entries={habit.entries || []}
          />
        ))}
      </div>
      
      {filteredHabits.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-zinc-500">Nincs a szűrésnek megfelelő szokás</p>
        </div>
      )}
    </div>
  );
}