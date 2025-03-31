import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ADMIN } from "@/utils/validators/APIConstants";
import { permissionDeniedReturn } from "@/utils/validators/APIValidators";
import { ApiErrors, createApiError } from "@/utils/errors/api-errors";
import { startOfDay, startOfWeek, startOfMonth, subDays, eachDayOfInterval, isSameDay, parseISO, max } from "date-fns";

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

    const now = new Date();
    const todayStart = startOfDay(now).toISOString();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
    const monthStart = startOfMonth(now).toISOString();

    const { data: todayHabits, error: todayError } = await supabase
      .from("habits")
      .select("habit_id, is_active")
      .eq("related_user_id", user.id)
      .eq("is_active", true);

    if (todayError) {
      console.error("Error fetching today's habits:", todayError);
      return createApiError("ENTRY_FETCH_ERROR");
    }

    const todayHabitIds = todayHabits.map(habit => habit.habit_id);

    const { data: allHabits, error: allHabitsError } = await supabase
      .from("habits")
      .select(`
        habit_id,
        habit_names:habit_name_id(habit_name), 
        entries(*),
        habit_interval_type,
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

    console.log(allHabits);

    let dayStatistics = [0, 0];
    let weekStatistics = [0, 0];
    let monthStatistics = [0, 0];

    let previousDayStatistics = [0, 0];
    let previousWeekStatistics = [0, 0];
    let previousMonthStatistics = [0, 0];

    let today = new Date();
    today.setHours(23, 59, 59, 999); 

    let yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);
    
    let monthStart2 = new Date(today.getFullYear(), today.getMonth(), 1);
    monthStart2.setHours(0, 0, 0, 0);
    
    let previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    previousMonthStart.setHours(0, 0, 0, 0);
    let previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    previousMonthEnd.setHours(23, 59, 59, 999);
    
    let weekFirstDay = new Date(today);
    const dayOfWeek = today.getDay(); 
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    weekFirstDay.setDate(today.getDate() - diff);
    weekFirstDay.setHours(0, 0, 0, 0);
    
    let previousWeekFirstDay = new Date(weekFirstDay);
    previousWeekFirstDay.setDate(previousWeekFirstDay.getDate() - 7);
    let previousWeekLastDay = new Date(weekFirstDay);
    previousWeekLastDay.setDate(previousWeekLastDay.getDate() - 1);
    previousWeekLastDay.setHours(23, 59, 59, 999);

    let day = today.toISOString().split('T')[0];
    let yesterdayStr = yesterday.toISOString().split('T')[0];
    let currentWeekFirstDay = weekFirstDay.toISOString().split('T')[0];
    let month = monthStart2.toISOString().split('T')[0];
    
    console.log("Today:", day);
    console.log("Yesterday:", yesterdayStr);
    console.log("Week start:", currentWeekFirstDay);
    console.log("Month start:", month);
    console.log("Previous week:", previousWeekFirstDay.toISOString().split('T')[0], "to", previousWeekLastDay.toISOString().split('T')[0]);
    console.log("Previous month:", previousMonthStart.toISOString().split('T')[0], "to", previousMonthEnd.toISOString().split('T')[0]);

    let dayCompletionRateChange = 0;
    let weekCompletionRateChange = 0;
    let monthCompletionRateChange = 0;

    allHabits.forEach(habit => {
    if (habit.habit_interval_type === "days") {
        let habitStartDate = new Date(habit.start_date);
        habitStartDate.setHours(23, 59, 59, 999); 
        
        let calculationStartDate = new Date(Math.min(
            previousMonthStart.getTime(),
            habitStartDate.getTime()
        ));
        
        console.log(`Processing habit: ${habit.habit_names?.[0]?.habit_name || "Unknown"}, starting from: ${calculationStartDate.toISOString().split('T')[0]}`);
        
        for (let currentDate = new Date(calculationStartDate); currentDate <= today; currentDate.setDate(currentDate.getDate() + 1)) {
        const currentDay = currentDate.toISOString().split('T')[0];
        
        let habitEntries = habit.entries.filter(entry => {
            let entryDate = new Date(entry.datetime);
            return entryDate.toISOString().split('T')[0] === currentDay;
        });

        let isCompleted = habitEntries.length > 0 && habitEntries[0].entry_type === "done";
        
        const isBadHabit = habit.habit_type === "bad_habit";
        const isSuccess = isBadHabit ? !isCompleted : isCompleted;
        
        if (currentDate >= monthStart2 && currentDate <= today) {
            if (isSuccess) {
                monthStatistics[0]++; 
            } else {
                monthStatistics[1]++; 
            }
        }
        
        if (currentDate >= previousMonthStart && currentDate <= previousMonthEnd) {
            if (isSuccess) {
                previousMonthStatistics[0]++;
            } else {
                previousMonthStatistics[1]++;
            }
        }
        
        if (currentDate >= weekFirstDay && currentDate <= today) {
            if (isSuccess) {
                weekStatistics[0]++;
            } else {
                weekStatistics[1]++;
            }
        }
        
        if (currentDate >= previousWeekFirstDay && currentDate <= previousWeekLastDay) {
            if (isSuccess) {
                previousWeekStatistics[0]++;
            } else {
                previousWeekStatistics[1]++;
            }
        }
        
        if (currentDay === day) {
            if (isSuccess) {
                dayStatistics[0]++;
            } else {
                dayStatistics[1]++;
            }
        }
        
        if (currentDay === yesterdayStr) {
            if (isSuccess) {
                previousDayStatistics[0]++;
            } else {
                previousDayStatistics[1]++;
            }
        }
        }
    }
    });

    console.log("Today stats:", dayStatistics);
    console.log("Yesterday stats:", previousDayStatistics);
    console.log("Week stats:", weekStatistics);
    console.log("Previous week stats:", previousWeekStatistics);
    console.log("Month stats:", monthStatistics);
    console.log("Previous month stats:", previousMonthStatistics);

    // Calculate completion rates
    let todayCompletionRate = (dayStatistics[0] + dayStatistics[1]) > 0 ? dayStatistics[0] / (dayStatistics[0] + dayStatistics[1]) : 0;
    let yesterdayCompletionRate = (previousDayStatistics[0] + previousDayStatistics[1]) > 0 ? previousDayStatistics[0] / (previousDayStatistics[0] + previousDayStatistics[1]) : 0;
    let weeklyCompletionRate = (weekStatistics[0] + weekStatistics[1]) > 0 ? weekStatistics[0] / (weekStatistics[0] + weekStatistics[1]) : 0;
    let previousWeekCompletionRate = (previousWeekStatistics[0] + previousWeekStatistics[1]) > 0 ? previousWeekStatistics[0] / (previousWeekStatistics[0] + previousWeekStatistics[1]) : 0;
    let monthlyCompletionRate = (monthStatistics[0] + monthStatistics[1]) > 0 ? monthStatistics[0] / (monthStatistics[0] + monthStatistics[1]) : 0;
    let previousMonthCompletionRate = (previousMonthStatistics[0] + previousMonthStatistics[1]) > 0 ? previousMonthStatistics[0] / (previousMonthStatistics[0] + previousMonthStatistics[1]) : 0;

    dayCompletionRateChange = todayCompletionRate - yesterdayCompletionRate;
    weekCompletionRateChange = weeklyCompletionRate - previousWeekCompletionRate;
    monthCompletionRateChange = monthlyCompletionRate - previousMonthCompletionRate;

    let longestStreak = 0;
    let currentStreak = 0;
    let totalCompletedCount = 0;
    let totalSkippedCount = 0;

    const { data: allEntries, error: entriesError } = await supabase
      .from("entries")
      .select("*")
      .eq("user_id", user.id);

    if (entriesError) {
      console.error("Error fetching entries:", entriesError);
    } else if (allEntries) {
      totalCompletedCount = allEntries.filter(entry => entry.entry_type === "done").length;
      totalSkippedCount = allEntries.filter(entry => entry.entry_type === "skipped").length;
      
      const sortedEntries = allEntries
        .filter(entry => entry.entry_type === "done")
        .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
      
      if (sortedEntries.length > 0) {
        const entriesByDate: Record<string, any[]> = {};
        sortedEntries.forEach(entry => {
          const dateStr = new Date(entry.datetime).toISOString().split('T')[0];
          if (!entriesByDate[dateStr]) {
            entriesByDate[dateStr] = [];
          }
          entriesByDate[dateStr].push(entry);
        });
        
        const dates = Object.keys(entriesByDate).sort();
        let streak = 1;
        let maxStreak = 1;
        
        for (let i = 1; i < dates.length; i++) {
          const curr = new Date(dates[i]);
          const prev = new Date(dates[i-1]);
          const dayDiff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
          
          if (dayDiff === 1) {
            streak++;
            maxStreak = Math.max(maxStreak, streak);
          } else {
            streak = 1;
          }
        }
        
        const todayStr = new Date().toISOString().split('T')[0];
        if (entriesByDate[todayStr]) {
          currentStreak = streak;
        } else {
          const lastEntryDate = new Date(dates[dates.length - 1]);
          const today = new Date();
          const daysSinceLastEntry = Math.round((today.getTime() - lastEntryDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceLastEntry <= 1) {
            currentStreak = streak;
          } else {
            currentStreak = 0;
          }
        }
        
        longestStreak = maxStreak;
      }
    }

    const stats = {
      dailyStats: {
        todayCompletionRate,
        weeklyCompletionRate,
        monthlyCompletionRate,
        dayCompletionRateChange,
        weekCompletionRateChange,
        monthCompletionRateChange
      },
      streaks: {
        longestStreak,
        currentStreak
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