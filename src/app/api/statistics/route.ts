import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createApiError } from "@/utils/errors/api-errors";
import { 
  startOfWeek, startOfMonth, startOfYear, subDays, eachDayOfInterval, 
  subWeeks, subMonths, subYears, endOfWeek, endOfMonth, endOfYear, addDays 
} from "date-fns";
import { isHabitCompletedOnDate, calculateHabitStreak } from "@/utils/habit-utils";

// GET /api/statistics ~ Statisztikák lekérdezése
export async function GET() {

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

    const thisYearStart = startOfYear(today);
    const thisYearEnd = endOfYear(today);
    const lastYearStart = startOfYear(subYears(today, 1));
    const lastYearEnd = endOfYear(subYears(today, 1));

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
    const yearStatistics = [0, 0, 0];

    const previousDayStatistics = [0, 0, 0];
    const previousWeekStatistics = [0, 0, 0];
    const previousMonthStatistics = [0, 0, 0];
    const previousYearStatistics = [0, 0, 0];

    let longestStreakHabit = { habitName: "Nincs adat", days: 0 };
    let currentStreakHabit = { habitName: "Nincs adat", days: 0 };
    let totalCompletedCount = 0;
    let totalSkippedCount = 0;

    
    allHabits.forEach(habit => {
      const habitStartDate = new Date(habit.start_date);
      
      if (habitStartDate <= today) {
        const todayResult = isHabitCompletedOnDate(habit, today);
        
        if (todayResult.isCompleted) {
          dayStatistics[0]++;
        } else if (todayResult.isSkipped) {
          dayStatistics[1]++;
        }
        dayStatistics[2]++;
        
        if (habitStartDate <= yesterday) {
          const yesterdayResult = isHabitCompletedOnDate(habit, yesterday);
          if (yesterdayResult.isCompleted) {
            previousDayStatistics[0]++;
          } else if (yesterdayResult.isSkipped) {
            previousDayStatistics[1]++;
          }
          previousDayStatistics[2]++;
        }
      }
      
      if (habitStartDate <= thisWeekEnd) {
        let thisWeekCompleted = 0;
        let thisWeekSkipped = 0;
        let thisWeekTotal = 0;
        
        thisWeekDays.forEach(day => {
          if (habitStartDate <= day) {
            const dayResult = isHabitCompletedOnDate(habit, day);
            if (dayResult.isCompleted) {
              thisWeekCompleted++;
            } else if (dayResult.isSkipped) {
              thisWeekSkipped++;
            }
            thisWeekTotal++;
          }
        });
        
        weekStatistics[0] += thisWeekCompleted;
        weekStatistics[1] += thisWeekSkipped;
        weekStatistics[2] += thisWeekTotal;
        
        if (habitStartDate <= lastWeekEnd) {
          let lastWeekCompleted = 0;
          let lastWeekSkipped = 0;
          let lastWeekTotal = 0;
          
          lastWeekDays.forEach(day => {
            if (habitStartDate <= day) {
              const dayResult = isHabitCompletedOnDate(habit, day);
              if (dayResult.isCompleted) {
                lastWeekCompleted++;
              } else if (dayResult.isSkipped) {
                lastWeekSkipped++;
              }
              lastWeekTotal++;
            }
          });
          
          previousWeekStatistics[0] += lastWeekCompleted;
          previousWeekStatistics[1] += lastWeekSkipped;
          previousWeekStatistics[2] += lastWeekTotal;
        }
      }
      
      if (habitStartDate <= thisMonthEnd) {
        let thisMonthCompleted = 0;
        let thisMonthSkipped = 0;
        let thisMonthTotal = 0;
        
        thisMonthDays.forEach(day => {
          if (habitStartDate <= day) {
            const dayResult = isHabitCompletedOnDate(habit, day);
            if (dayResult.isCompleted) {
              thisMonthCompleted++;
            } else if (dayResult.isSkipped) {
              thisMonthSkipped++;
            }
            thisMonthTotal++;
          }
        });
        
        monthStatistics[0] += thisMonthCompleted;
        monthStatistics[1] += thisMonthSkipped;
        monthStatistics[2] += thisMonthTotal;
        
        if (habitStartDate <= lastMonthEnd) {
          let lastMonthCompleted = 0;
          let lastMonthSkipped = 0;
          let lastMonthTotal = 0;
          
          lastMonthDays.forEach(day => {
            if (habitStartDate <= day) {
              const dayResult = isHabitCompletedOnDate(habit, day);
              if (dayResult.isCompleted) {
                lastMonthCompleted++;
              } else if (dayResult.isSkipped) {
                lastMonthSkipped++;
              }
              lastMonthTotal++;
            }
          });
          
          previousMonthStatistics[0] += lastMonthCompleted;
          previousMonthStatistics[1] += lastMonthSkipped;
          previousMonthStatistics[2] += lastMonthTotal;
        }
      }
      
      if (habitStartDate <= thisYearEnd) {
        let thisYearCompleted = 0;
        let thisYearSkipped = 0;
        let thisYearTotal = 0;
        
        for (let month = 0; month < 12; month++) {
          const monthStart = new Date(thisYearStart.getFullYear(), month, 1);
          const monthEnd = new Date(thisYearStart.getFullYear(), month + 1, 0);
          
          if (habitStartDate <= monthEnd) {
            const monthResult = isHabitCompletedOnDate(habit, monthEnd);
            if (monthResult.isCompleted) {
              thisYearCompleted++;
            } else if (monthResult.isSkipped) {
              thisYearSkipped++;
            }
            thisYearTotal++;
          }
        }
        
        yearStatistics[0] += thisYearCompleted;
        yearStatistics[1] += thisYearSkipped;
        yearStatistics[2] += thisYearTotal;
        
        if (habitStartDate <= lastYearEnd) {
          let lastYearCompleted = 0;
          let lastYearSkipped = 0;
          let lastYearTotal = 0;
          
          for (let month = 0; month < 12; month++) {
            const monthStart = new Date(lastYearStart.getFullYear(), month, 1);
            const monthEnd = new Date(lastYearStart.getFullYear(), month + 1, 0);
            
            if (habitStartDate <= monthEnd) {
              const monthResult = isHabitCompletedOnDate(habit, monthEnd);
              if (monthResult.isCompleted) {
                lastYearCompleted++;
              } else if (monthResult.isSkipped) {
                lastYearSkipped++;
              }
              lastYearTotal++;
            }
          }
          
          previousYearStatistics[0] += lastYearCompleted;
          previousYearStatistics[1] += lastYearSkipped;
          previousYearStatistics[2] += lastYearTotal;
        }
      }
      
      const completedEntries = habit.entries.filter(entry => entry.entry_type === "done").length;
      const skippedEntries = habit.entries.filter(entry => entry.entry_type === "skipped").length;
      
      totalCompletedCount += completedEntries;
      totalSkippedCount += skippedEntries;
      
      const currentStreak = calculateHabitStreak(habit, today);
      
      if (currentStreak > longestStreakHabit.days) {
        longestStreakHabit = {
          habitName: Array.isArray(habit.habit_names) 
            ? (habit.habit_names[0] as { habit_name?: string })?.habit_name || "Ismeretlen"
            : (habit.habit_names as { habit_name?: string })?.habit_name || "Ismeretlen",
          days: currentStreak
        };
      }
      
      if (currentStreak > currentStreakHabit.days) {
        currentStreakHabit = {
          habitName: Array.isArray(habit.habit_names)
            ? (habit.habit_names[0] as { habit_name?: string })?.habit_name || "Ismeretlen"
            : (habit.habit_names as { habit_name?: string })?.habit_name || "Ismeretlen",
          days: currentStreak
        };
      }
    }); 


    const activeDay = dayStatistics[2] - dayStatistics[1];
    const activeWeek = weekStatistics[2] - weekStatistics[1];
    const activeMonth = monthStatistics[2] - monthStatistics[1];
    const activeYear = yearStatistics[2] - yearStatistics[1];
    
    const todayCompletionRate = activeDay > 0 ? dayStatistics[0] / activeDay : 0;
    const weeklyCompletionRate = activeWeek > 0 ? weekStatistics[0] / activeWeek : 0;
    const monthlyCompletionRate = activeMonth > 0 ? monthStatistics[0] / activeMonth : 0;
    const yearlyCompletionRate = activeYear > 0 ? yearStatistics[0] / activeYear : 0;
    
    let dayCompletionRateChange = 0;
    let weekCompletionRateChange = 0;
    let monthCompletionRateChange = 0;
    let yearCompletionRateChange = 0;


    const dayRate = dayStatistics[0] / (dayStatistics[2] - dayStatistics[1])
    const prevDayRate = previousDayStatistics[0] / (previousDayStatistics[2] - previousDayStatistics[1])

    dayCompletionRateChange = (dayRate - prevDayRate)/prevDayRate;

    const weekRate = weekStatistics[0] / (weekStatistics[2] - weekStatistics[1])
    const prevWeekRate = previousWeekStatistics[0] / (previousWeekStatistics[2] - previousWeekStatistics[1])

    weekCompletionRateChange = (weekRate - prevWeekRate)/prevWeekRate;

    const monthRate = monthStatistics[0] / (monthStatistics[2] - monthStatistics[1])
    const prevMonthRate = previousMonthStatistics[0] / (previousMonthStatistics[2] - previousMonthStatistics[1])

    monthCompletionRateChange = (monthRate - prevMonthRate)/prevMonthRate;

    const yearRate = yearStatistics[0] / (yearStatistics[2] - yearStatistics[1])
    const prevYearRate = previousYearStatistics[0] / (previousYearStatistics[2] - previousYearStatistics[1])

    yearCompletionRateChange = (yearRate - prevYearRate)/prevYearRate;
    
    const allHabitsCount = allHabits.length;

    const stats = {
      dailyStats: {
        todayCompletionRate,
        weeklyCompletionRate,
        monthlyCompletionRate,
        yearlyCompletionRate,
        dayCompletionRateChange,
        weekCompletionRateChange,
        monthCompletionRateChange,
        yearCompletionRateChange,
        skippedDay: dayStatistics[1],
        skippedWeek: weekStatistics[1],
        skippedMonth: monthStatistics[1],
        skippedYear: yearStatistics[1]
      },
      streaks: {
        longestStreak: longestStreakHabit,
        currentStreak: currentStreakHabit
      },
      overallStats: {
        totalCompletedCount,
        allHabitsCount,
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
