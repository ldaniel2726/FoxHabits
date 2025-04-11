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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { habitFormSchema } from "@/types/HabitFormSchema";

type FormSchema = z.infer<typeof habitFormSchema>;

export default function HabitCreateFormComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHabitType, setSelectedHabitType] = useState<"normal_habit" | "bad_habit">("normal_habit");
  const router = useRouter();

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      habit_type: "normal_habit",
      interval: 1,
      habit_interval_type: "days",
      start_date: new Date().toISOString().split('T')[0],
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="habit_name">Szokás neve</Label>
        <Input id="habit_name" {...register("habit_names")} />
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
