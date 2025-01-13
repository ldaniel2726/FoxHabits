'use client';

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  habit_name: z.string().min(1).max(255),
  habit_type: z.enum(["normal_habit", "bad_habit"]),
  interval: z.number().positive(),
  habit_interval_type: z.enum(["hours", "days", "weeks", "months", "years"]),
  start_date: z.string().datetime(),
  is_active: z.boolean(),
});

type FormSchema = z.infer<typeof formSchema>;

interface HabitEditFormComponentProps {
  habit: FormSchema;
  id: string;
}

export default function HabitEditFormComponent({ habit, id }: HabitEditFormComponentProps) {
  console.log(habit);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...habit,
      start_date: habit.start_date ? new Date(habit.start_date).toISOString().slice(0, 16) : undefined,
    },
  });

  const onSubmit = async (data: FormSchema) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/habits/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Hiba történt a szokás frissítésekor');
      }

      router.push('/habits');
      router.refresh();
    } catch (error) {
      console.error('Hiba:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="habit_name">Szokás neve</Label>
        <Input
          id="habit_name"
          {...register("habit_name")}
          defaultValue={habit.data.habit_names.habit_name}
        />
        {errors.habit_name && <p className="text-red-500">{errors.habit_name.message}</p>}
      </div>

      <div>
        <Label htmlFor="habit_type">Szokás típusa</Label>
        <Select defaultValue={habit.data.habit_type} {...register("habit_type")}>
          <SelectTrigger>
            <SelectContent>
                <SelectItem key="normal_habit" value="normal_habit">Normál szokás</SelectItem>
                <SelectItem key="bad_habit" value="bad_habit">Rossz szokás</SelectItem>
            </SelectContent>
          </SelectTrigger>
        </Select>
        {errors.habit_type && <p className="text-red-500">{errors.habit_type.message}</p>}
      </div>

      <div>
        <Label htmlFor="interval">Intervallum</Label>
        <Input
          id="interval"
          type="number"
          {...register("interval", { valueAsNumber: true })}
          defaultValue={habit.data.interval}
        />
        {errors.interval && <p className="text-red-500">{errors.interval.message}</p>}
      </div>

      <div>
        <Label htmlFor="habit_interval_type">Intervallum típusa</Label>
        <Select defaultValue={habit.data.habit_interval_type} {...register("habit_interval_type")}>
          <SelectTrigger>
            <SelectContent>
              <SelectItem key="hours" value="hours">Óra</SelectItem>
              <SelectItem key="days" value="days">Nap</SelectItem>
              <SelectItem key="weeks" value="weeks">Hét</SelectItem>
              <SelectItem key="months" value="months">Hónap</SelectItem>
              <SelectItem key="years" value="years">Év</SelectItem>
            </SelectContent>
          </SelectTrigger>
        </Select>
        {errors.habit_interval_type && <p className="text-red-500">{errors.habit_interval_type.message}</p>}
      </div>

      <div>
        <Label htmlFor="start_date">Kezdő dátum</Label>
        <Input
          id="start_date"
          type="datetime-local"
          {...register("start_date")}
          defaultValue={habit.data.start_date ? new Date(habit.data.start_date).toISOString().slice(0, 16) : undefined}
        />
        {errors.start_date && <p className="text-red-500">{errors.start_date.message}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_active"
          {...register("is_active")}
          defaultChecked={habit.data.is_active}
        />
        <Label htmlFor="is_active">Aktív</Label>
      </div>
      {errors.is_active && <p className="text-red-500">{errors.is_active.message}</p>}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Mentés..." : "Szokás mentése"}
      </Button>
    </form>
  );
}
