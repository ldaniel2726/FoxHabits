import { createClient } from '@/utils/supabase/server'

export async function getTodayHabits() {
  const supabase = await createClient()
  
  const today = new Date().toISOString().split('T')[0]

  const dayOfWeek = new Date().getDay()

  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('is_active', true)

    const habits = []

    // todo: better handling for hourly habits


    if (data) {
      for (const habit of data) {
        if (habit.is_active && habit.habit_interval_type === "hours") { habits.push(habit); }
        if (habit.is_active && habit.habit_interval_type === "days" && habit.interval === 1) { habits.push(habit); }
        if (habit.is_active && habit.habit_interval_type === "days" && habit.interval > 1) {
          if (habit.start_date) {
            const startDate = new Date(habit.start_date);
            const daysOfInterval = habit.interval;
            const dayOfIntervalIndex = startDate.getDate();

            if (dayOfIntervalIndex === dayOfWeek) {
              habits.push(habit);
            }
          }
        }
        if (habit.is_active && habit.habit_interval_type === "weeks") {
          if (habit.start_date) {
            const startDate = new Date(habit.start_date);
            const daysOfWeek = habit.interval;
            const dayOfWeekIndex = startDate.getDay();

            if (dayOfWeekIndex === dayOfWeek) {
              habits.push(habit);
            }
          }
        }
        if (habit.is_active && habit.habit_interval_type === "months") {
          if (habit.start_date) {
            const startDate = new Date(habit.start_date);
            const daysOfMonth = habit.interval;
            const dayOfMonthIndex = startDate.getDate();

            if (dayOfMonthIndex === dayOfWeek) {
              habits.push(habit);
            }
          }
        }
        if (habit.is_active && habit.habit_interval_type === "years") {
          if (habit.start_date) {
            const startDate = new Date(habit.start_date);
            const daysOfYear = habit.interval;
            const dayOfYearIndex = startDate.getDate();

            if (dayOfYearIndex === dayOfWeek) {
              habits.push(habit);
            }
          }
        }
      }
    }

  if (error) {
    console.error('Error fetching habits:', error)
    return { success: false, error }
  }

  return { success: true, habits, dayOfWeek }
} 