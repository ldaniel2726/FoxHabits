import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ADMIN } from "@/utils/validators/APIConstants";
import { permissionDeniedReturn } from "@/utils/validators/APIValidators";
import { ApiErrors, createApiError } from "@/utils/errors/api-errors";
import { 
  startOfDay, startOfWeek, startOfMonth, subDays, eachDayOfInterval, 
  isSameDay, parseISO, max, subWeeks, subMonths, endOfWeek, endOfMonth, addDays 
} from "date-fns";
import { 
  isHabitCompletedOnDate, 
  isHabitCompletedExactDay, 
  isHabitCompletedForPeriod,
  calculateHabitStreak 
} from "@/utils/habit-utils";

// GET /api/statistics ~ Statisztikák lekérdezése
export async function GET() {
  console.log("Statistics route called");

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return createApiError("UNAUTHORIZED");
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999); 

    const yesterday = subDays(today, 1);
    
    const thisWeekStart = addDays(startOfWeek(today), 1);
    const thisWeekEnd = addDays(endOfWeek(today), 1);
    const lastWeekStart = addDays(startOfWeek(subWeeks(today, 1)), 1);
    const lastWeekEnd = addDays(endOfWeek(subWeeks(today, 1)), 1);
    
    const thisMonthStart = startOfMonth(today);
    const thisMonthEnd = endOfMonth(today);
    const lastMonthStart = startOfMonth(subMonths(today, 1));
    const lastMonthEnd = endOfMonth(subMonths(today, 1));

    console.log(today);
    console.log(yesterday);
    console.log(thisWeekStart);
    console.log(thisWeekEnd);
    console.log(lastWeekStart);
    console.log(lastWeekEnd);
    console.log(thisMonthStart);
    console.log(thisMonthEnd);
    console.log(lastMonthStart);
    console.log(lastMonthEnd);


    const thisWeekDays = eachDayOfInterval({ start: thisWeekStart, end: thisWeekEnd });
    const lastWeekDays = eachDayOfInterval({ start: lastWeekStart, end: lastWeekEnd });
    const thisMonthDays = eachDayOfInterval({ start: thisMonthStart, end: thisMonthEnd });
    const lastMonthDays = eachDayOfInterval({ start: lastMonthStart, end: lastMonthEnd });

    const { data: allHabits, error: allHabitsError } = await supabase
      .from("habits")
      .select(`
        habit_id,
        habit_names:habit_name_id(habit_name), 
        entries(*),
        habit_interval_type,
        interval,
        start_date,
        is_active,
        habit_type
      `)
      .eq("related_user_id", user.id)
      .eq("is_active", true)
      .order("created_date", { ascending: false });

    if (allHabitsError) {
      console.error("Error fetching all habits:", allHabitsError);
      return createApiError("ENTRY_FETCH_ERROR");
    }

    const dayStatistics = [0, 0, 0];
    const weekStatistics = [0, 0, 0];
    const monthStatistics = [0, 0, 0];

    const previousDayStatistics = [0, 0, 0];
    const previousWeekStatistics = [0, 0, 0];
    const previousMonthStatistics = [0, 0, 0];

    let longestStreakHabit = { habitName: "Nincs adat", days: 0 };
    let currentStreakHabit = { habitName: "Nincs adat", days: 0 };
    let totalCompletedCount = 0;
    let totalSkippedCount = 0;
    
    allHabits.forEach(habit => {
      console.log("TESZT");
      console.log(habit);
      console.log(isHabitCompletedOnDate(habit, today));
      const habitStartDate = new Date(habit.start_date);
      
      if (habitStartDate <= today) {
        const todayResult = isHabitCompletedExactDay(habit, today);
        
        if (todayResult.isCompleted) {
          dayStatistics[0]++;
        } else if (todayResult.isSkipped) {
          dayStatistics[1]++;
        }
        dayStatistics[2]++;
        
        if (habitStartDate <= yesterday) {
          const yesterdayResult = isHabitCompletedExactDay(habit, yesterday);
          if (yesterdayResult.isCompleted) {
            previousDayStatistics[0]++;
          } else if (yesterdayResult.isSkipped) {
            previousDayStatistics[1]++;
          }
          previousDayStatistics[2]++;
        }
      }
      
      if (habitStartDate <= thisWeekEnd) {
        const thisWeekResult = isHabitCompletedForPeriod(habit, thisWeekStart, today);
        console.log(thisWeekResult);
        
        weekStatistics[0] = thisWeekResult.completedDays[0];
        weekStatistics[1] = thisWeekResult.completedDays[1];
        weekStatistics[2] = thisWeekResult.completedDays[2];
        
        if (habitStartDate <= lastWeekEnd) {
          const lastWeekResult = isHabitCompletedForPeriod(habit, lastWeekStart, lastWeekEnd);
          
          previousWeekStatistics[0] = lastWeekResult.completedDays[0];
          previousWeekStatistics[1] = lastWeekResult.completedDays[1];
          previousWeekStatistics[2] = lastWeekResult.completedDays[2];
        }
      }
      
      if (habitStartDate <= thisMonthEnd) {
        const thisMonthResult = isHabitCompletedForPeriod(habit, thisMonthStart, today);
        
        monthStatistics[0] = thisMonthResult.completedDays[0];
        monthStatistics[1] = thisMonthResult.completedDays[1];
        monthStatistics[2] = thisMonthResult.completedDays[2];
        
        if (habitStartDate <= lastMonthEnd) {
          const lastMonthResult = isHabitCompletedForPeriod(habit, lastMonthStart, lastMonthEnd);
          
          previousMonthStatistics[0] = lastMonthResult.completedDays[0];
          previousMonthStatistics[1] = lastMonthResult.completedDays[1];
          previousMonthStatistics[2] = lastMonthResult.completedDays[2];
        }
      }
      
      const completedEntries = habit.entries.filter(entry => entry.entry_type === "done").length;
      const skippedEntries = habit.entries.filter(entry => entry.entry_type === "skipped").length;
      
      totalCompletedCount += completedEntries;
      totalSkippedCount += skippedEntries;
      
      const currentStreak = calculateHabitStreak(habit, today);
      
      const maxStreak = currentStreak;
      
      if (maxStreak > longestStreakHabit.days) {
        longestStreakHabit = {
          habitName: habit.habit_names.habit_name || "Ismeretlen",
          days: maxStreak
        };
      }
      
      if (currentStreak > currentStreakHabit.days) {
        currentStreakHabit = {
          habitName: habit.habit_names.habit_name || "Ismeretlen",
          days: currentStreak
        };
      }
    });

    console.log(dayStatistics);
    console.log(weekStatistics);
    console.log(monthStatistics);

    console.log(previousDayStatistics);
    console.log(previousWeekStatistics);
    console.log(previousMonthStatistics);

    const activeDay = dayStatistics[2] - dayStatistics[1]; // Total - skipped
    const activeWeek = weekStatistics[2] - weekStatistics[1];
    const activeMonth = monthStatistics[2] - monthStatistics[1];
    
    let todayCompletionRate = activeDay > 0 ? dayStatistics[0] / activeDay : 0;
    let weeklyCompletionRate = activeWeek > 0 ? weekStatistics[0] / activeWeek : 0;
    let monthlyCompletionRate = activeMonth > 0 ? monthStatistics[0] / activeMonth : 0;
    
    let dayCompletionRateChange = 0;
    let weekCompletionRateChange = 0;
    let monthCompletionRateChange = 0;
    
    const activePrevDay = previousDayStatistics[2] - previousDayStatistics[1];
    const activePrevWeek = previousWeekStatistics[2] - previousWeekStatistics[1];
    const activePrevMonth = previousMonthStatistics[2] - previousMonthStatistics[1];
    
    if (activePrevDay > 0) {
      const prevDayRate = previousDayStatistics[0] / activePrevDay;
      dayCompletionRateChange = todayCompletionRate - prevDayRate;
    }
    
    if (activePrevWeek > 0) {
      const prevWeekRate = previousWeekStatistics[0] / activePrevWeek;
      weekCompletionRateChange = weeklyCompletionRate - prevWeekRate;
    }
    
    if (activePrevMonth > 0) {
      const prevMonthRate = previousMonthStatistics[0] / activePrevMonth;
      monthCompletionRateChange = monthlyCompletionRate - prevMonthRate;
    }

    const stats = {
      dailyStats: {
        todayCompletionRate,
        weeklyCompletionRate,
        monthlyCompletionRate,
        dayCompletionRateChange,
        weekCompletionRateChange,
        monthCompletionRateChange,
        skippedDay: dayStatistics[1],
        skippedWeek: weekStatistics[1],
        skippedMonth: monthStatistics[1]
      },
      streaks: {
        longestStreak: longestStreakHabit,
        currentStreak: currentStreakHabit
      },
      overallStats: {
        totalCompletedCount,
        totalSkippedCount
      }
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Statistics calculation error:", error);
    return NextResponse.json(
      { error: "Hiba történt a statisztikák számításakor." },
      { status: 500 }
    );
  }
} 