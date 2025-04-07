import { createClient } from '@/utils/supabase/server'

export async function getTodayHabits(dateParam: string) {
  const supabase = await createClient()

  const targetDate = new Date(dateParam)
  if (isNaN(targetDate.getTime())) {
    targetDate.setTime(new Date().getTime())
  }

  const dayOfWeek = targetDate.getDay()

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return { success: false, error: 'No session found' }
  
  const userId = (await supabase.auth.getUser()).data.user?.id;

  const { data, error } = await supabase
    .from('habits')
    .select('*, habit_names( habit_name )')
    .eq('is_active', true)
    .eq('related_user_id', userId)

  const habits = []

  if (data) {
    for (const habit of data) {
      if (!habit.start_date) continue

      const habitDate = new Date(habit.start_date)
      if (targetDate < habitDate) continue

      switch (habit.habit_interval_type) {
        case "hours":
          habit.habit_name_id = habit.habit_names?.habit_name || habit.habit_name_id;
          habits.push(habit)
          break

        case "days": {
          const diffMillis = targetDate.getTime() - habitDate.getTime()
          const diffDays = Math.floor(diffMillis / (1000 * 60 * 60 * 24))
          if (diffDays % habit.interval === 0) {
            habit.habit_name_id = habit.habit_names?.habit_name || habit.habit_name_id;
            habits.push(habit)
          }
          break
        }
        case "weeks": {
          const diffMillis = targetDate.getTime() - habitDate.getTime()
          const diffDays = Math.floor(diffMillis / (1000 * 60 * 60 * 24))
          const diffWeeks = Math.floor(diffDays / 7)
          if (targetDate.getDay() === habitDate.getDay() && diffWeeks % habit.interval === 0) {
            habit.habit_name_id = habit.habit_names?.habit_name || habit.habit_name_id;
            habits.push(habit)
          }
          break
        }
        case "months": {
          const diffMonths = (targetDate.getFullYear() - habitDate.getFullYear()) * 12 + (targetDate.getMonth() - habitDate.getMonth())
          if (targetDate.getDate() === habitDate.getDate() && diffMonths % habit.interval === 0) {
            habit.habit_name_id = habit.habit_names?.habit_name || habit.habit_name_id;
            habits.push(habit)
          }
          break
        }
        case "years": {
          const diffYears = targetDate.getFullYear() - habitDate.getFullYear()
          if (
            targetDate.getMonth() === habitDate.getMonth() &&
            targetDate.getDate() === habitDate.getDate() &&
            diffYears % habit.interval === 0
          ) {
            habit.habit_name_id = habit.habit_names?.habit_name || habit.habit_name_id;
            habits.push(habit)
          }
          break
        }
        default:
          break
      }
    }
  }

  if (error) {
    console.error('Error fetching habits:', error)
    return { success: false, error }
  }

  return { success: true, habits, dayOfWeek }
}
