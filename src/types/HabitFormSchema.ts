import { z } from "zod";

export const habitFormSchema = z.object({
  habit_names: z.object({"habit_name": z.string().min(1).max(255)}),
  habit_type: z.enum(["normal_habit", "bad_habit"]),
  interval: z.number().positive(),
  habit_interval_type: z.enum(["hours", "days", "weeks", "months", "years"]),
  start_date: z.string().datetime(),
  is_active: z.boolean().nullable(),
});

export const createHabitFormSchema = z.object({
  habit_names: z.string().min(1).max(255),
  habit_type: z.enum(["normal_habit", "bad_habit"]),
  interval: z.number().positive(),
  habit_interval_type: z.enum(["hours", "days", "weeks", "months", "years"]),
  start_date: z.string().date(),
  is_active: z.boolean().nullable(),
});
