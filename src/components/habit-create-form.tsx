"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createHabitFormSchema } from "@/types/HabitFormSchema";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type FormSchema = z.infer<typeof createHabitFormSchema>;

export default function HabitCreateFormComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHabitType, setSelectedHabitType] = useState<"normal_habit" | "bad_habit">("normal_habit");
  const [approvedHabits, setApprovedHabits] = useState<{ habit_name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [filteredHabits, setFilteredHabits] = useState<{ habit_name: string }[]>([]);
  const router = useRouter();
  
  useEffect(() => {
    const fetchApprovedHabits = async () => {
      try {
        const response = await fetch("/api/habits/approved-names");
        if (response.ok) {
          const data = await response.json();
          setApprovedHabits(data);
          setFilteredHabits(data);
        }
      } catch (error) {
        console.error("Error fetching approved habits:", error);
      }
    };
    
    fetchApprovedHabits();
  }, []);
  
  useEffect(() => {
    if (inputValue) {
      const filtered = approvedHabits.filter(habit => 
        habit.habit_name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredHabits(filtered);
    } else {
      setFilteredHabits(approvedHabits);
    }
  }, [inputValue, approvedHabits]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(createHabitFormSchema),
    defaultValues: {
      habit_type: "normal_habit",
      interval: 1,
      habit_interval_type: "days",
      start_date: new Date().toLocaleDateString("en-CA"),
      is_active: true
    },
  });

  const onSubmit = async (data: FormSchema) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Hiba történt a szokás létrehozásakor");
      }

      router.push("/habits");
      router.refresh();
    } catch (error) {
      console.error("Hiba:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      handleSubmit(onSubmit)(e);
    }} className="space-y-6">
      <div>
        <Label htmlFor="habit_name">Szokás neve</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {inputValue || "Válassz vagy írj be egy szokást..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
            <Command>
              <CommandInput 
                placeholder="Keresés..." 
                value={inputValue}
                onValueChange={(value) => {
                  setInputValue(value);
                  setValue("habit_names", value);
                }}
              />
              <CommandList>
                <CommandEmpty>Nincs találat</CommandEmpty>
                <CommandGroup>
                  {filteredHabits.map((habit) => (
                    <CommandItem
                      key={habit.habit_name}
                      value={habit.habit_name}
                      onSelect={(currentValue) => {
                        setValue("habit_names", currentValue);
                        setInputValue(currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          inputValue === habit.habit_name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {habit.habit_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {errors.habit_names && (
          <p className="text-red-500">{errors.habit_names.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="habit_type">Szokás típusa</Label>
        <Select
          defaultValue="normal_habit"
          onValueChange={(value: "normal_habit" | "bad_habit") => {
            setValue("habit_type", value);
            setSelectedHabitType(value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Válassz típust" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal_habit">Normál szokás</SelectItem>
            <SelectItem value="bad_habit">Káros szokás</SelectItem>
          </SelectContent>
        </Select>
        {errors.habit_type && (
          <p className="text-red-500">{errors.habit_type.message}</p>
        )}
      </div>

      {selectedHabitType === "normal_habit" && (
        <div className="flex space-x-4">
          <div className="flex-1">
            <Label htmlFor="interval">Intervallum</Label>
            <Input
              id="interval"
              type="number"
              {...register("interval", { valueAsNumber: true })}
            />
            {errors.interval && (
              <p className="text-red-500">{errors.interval.message}</p>
            )}
          </div>

          <div className="flex-1">
            <Label htmlFor="habit_interval_type">Intervallum típusa</Label>
            <Select
              defaultValue="days"
              onValueChange={(value: "days" | "weeks" | "months" | "years") =>
                setValue("habit_interval_type", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="days">naponta</SelectItem>
                <SelectItem value="weeks">hetente</SelectItem>
                <SelectItem value="months">havonta</SelectItem>
                <SelectItem value="years">évente</SelectItem>
              </SelectContent>
            </Select>
            {errors.habit_interval_type && (
              <p className="text-red-500">{errors.habit_interval_type.message}</p>
            )}
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="start_date">Kezdő dátum</Label>
        <Input
          id="start_date"
          type="date"
          {...register("start_date")}
        />
        {errors.start_date && (
          <p className="text-red-500">{errors.start_date.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Létrehozás..." : "Szokás létrehozása"}
      </Button>
    </form>
  );
}
