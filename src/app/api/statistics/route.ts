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

    const dayStatistics = [0, 0];
    const weekStatistics = [0, 0];
    const monthStatistics = [0, 0];

    const previousDayStatistics = [0, 0];
    const previousWeekStatistics = [0, 0];
    const previousMonthStatistics = [0, 0];

    const today = new Date();
    today.setHours(23, 59, 59, 999); 

    const monthStart2 = new Date(today.getFullYear(), today.getMonth(), 1);
    monthStart2.setHours(0, 0, 0, 0);
    
    const weekFirstDay = new Date(today);
    const dayOfWeek = today.getDay(); 
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
    weekFirstDay.setDate(today.getDate() - diff);
    weekFirstDay.setHours(0, 0, 0, 0);

    const day = today.toISOString().split('T')[0];
    const currentWeekFirstDay = weekFirstDay.toISOString().split('T')[0];
    const month = monthStart2.toISOString().split('T')[0];
    
    console.log("Today:", day);
    console.log("Week start:", currentWeekFirstDay);
    console.log("Month start:", month);

    const dayCompletionRateChange = 0;
    const weekCompletionRateChange = 0;
    const monthCompletionRateChange = 0;

    allHabits.forEach(habit => {
    if (habit.habit_interval_type === "days") {
        const habitStartDate = new Date(habit.start_date);
        habitStartDate.setHours(23, 59, 59, 999); 
        
        const monthStartDate = new Date(month);
        const startDate = new Date(Math.max(monthStartDate.getTime(), habitStartDate.getTime()));
        
        console.log(`Processing habit: ${habit.habit_names?.[0]?.habit_name || "Unknown"}, starting from: ${startDate.toISOString().split('T')[0]}`);
        
        for (let currentDate = new Date(startDate); currentDate <= today; currentDate.setDate(currentDate.getDate() + 1)) {
        const currentDay = currentDate.toISOString().split('T')[0];
        
        const habitEntries = habit.entries.filter(entry => {
            const entryDate = new Date(entry.datetime);
            return entryDate.toISOString().split('T')[0] === currentDay;
        });

        const isCompleted = habitEntries.length > 0 && habitEntries[0].entry_type === "done";
        
        const isBadHabit = habit.habit_type === "bad_habit";
        const isSuccess = isBadHabit ? !isCompleted : isCompleted;
        
        if (isSuccess) {
            monthStatistics[0]++; 
        } else {
            monthStatistics[1]++; 
        }
        
        if (currentDate >= weekFirstDay) {
            if (isSuccess) {
                weekStatistics[0]++;
            } else {
                weekStatistics[1]++;
            }
        }
        
        if (currentDay === day) {
            if (isSuccess) {
                dayStatistics[0]++;
            } else {
                dayStatistics[1]++;
            }
        }
        }
    }
    });

    console.log(dayStatistics);
    console.log(weekStatistics);
    console.log(monthStatistics);

    let todayCompletionRate = 0;
    let weeklyCompletionRate = 0;
    let monthlyCompletionRate = 0;

    todayCompletionRate = dayStatistics[0] / (dayStatistics[0] + dayStatistics[1]);
    weeklyCompletionRate = weekStatistics[0] / (weekStatistics[0] + weekStatistics[1]);
    monthlyCompletionRate = monthStatistics[0] / (monthStatistics[0] + monthStatistics[1]);


    const longestStreak = 0;
    const currentStreak = 0;
    const totalCompletedCount = 0;
    const totalSkippedCount = 0;

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