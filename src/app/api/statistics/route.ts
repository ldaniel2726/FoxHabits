import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ADMIN } from "@/utils/validators/APIConstants";
import { permissionDeniedReturn } from "@/utils/validators/APIValidators";
import { ApiErrors, createApiError } from "@/utils/errors/api-errors";
import { 
  startOfDay, startOfWeek, startOfMonth, startOfYear, subDays, eachDayOfInterval, 
  isSameDay, parseISO, max, subWeeks, subMonths, subYears, endOfWeek, endOfMonth, endOfYear, addDays 
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

    const thisYearStart = startOfYear(today);
    const thisYearEnd = endOfYear(today);
    const lastYearStart = startOfYear(subYears(today, 1));
    const lastYearEnd = endOfYear(subYears(today, 1));

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
    console.log(thisYearStart);
    console.log(thisYearEnd);
    console.log(lastYearStart);
    console.log(lastYearEnd);

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
      
      // Today's statistics
      if (habitStartDate <= today) {
        const todayResult = isHabitCompletedOnDate(habit, today);
        
        if (todayResult.isCompleted) {
          dayStatistics[0]++;
        } else if (todayResult.isSkipped) {
          dayStatistics[1]++;
        }
        dayStatistics[2]++;
        
        // Yesterday's statistics
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
      
      // Weekly statistics
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
        
        // Last week statistics
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
      
      // Monthly statistics
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
        
        // Last month statistics
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
      
      // Yearly statistics
      if (habitStartDate <= thisYearEnd) {
        let thisYearCompleted = 0;
        let thisYearSkipped = 0;
        let thisYearTotal = 0;
        
        // Calculate for each month in the year
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
        
        // Last year statistics
        if (habitStartDate <= lastYearEnd) {
          let lastYearCompleted = 0;
          let lastYearSkipped = 0;
          let lastYearTotal = 0;
          
          // Calculate for each month in the last year
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

    console.log(dayStatistics);
    console.log(weekStatistics);
    console.log(monthStatistics);
    console.log(yearStatistics);

    console.log(previousDayStatistics);
    console.log(previousWeekStatistics);
    console.log(previousMonthStatistics);
    console.log(previousYearStatistics);

    const activeDay = dayStatistics[2] - dayStatistics[1]; // Total - skipped
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
    
    const activePrevDay = previousDayStatistics[2] - previousDayStatistics[1];
    const activePrevWeek = previousWeekStatistics[2] - previousWeekStatistics[1];
    const activePrevMonth = previousMonthStatistics[2] - previousMonthStatistics[1];
    const activePrevYear = previousYearStatistics[2] - previousYearStatistics[1];
    
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
    
    if (activePrevYear > 0) {
      const prevYearRate = previousYearStatistics[0] / activePrevYear;
      yearCompletionRateChange = yearlyCompletionRate - prevYearRate;
    }

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