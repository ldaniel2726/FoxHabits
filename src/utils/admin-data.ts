"use server";

import { supabaseAdmin } from "@/utils/supabase/admin";
import { AdminStats } from "@/types/AdminStats";
import { Habit } from "@/types/Habit";
import { User } from "@supabase/supabase-js";

export async function fetchHabits() {
  const { data: habits, error } = await supabaseAdmin
    .from("habits")
    .select(`
      *,
      habit_names!inner (
        habit_name_id,
        habit_name,
        habit_name_status
      )
    `)
    .in("habit_names.habit_name_status", ["new", "approved"])
    .order("created_date");

  if (error) {
    console.error("Error fetching habits:", error);
    return null;
  }

  if (habits && habits.length > 0) {
    const userIds = [...new Set(habits.map(habit => habit.related_user_id).filter(Boolean))];
    
    if (userIds.length > 0) {
      const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (userError) {
        console.error("Error fetching users for habits:", userError);
      } else if (users) {
        const userMap = new Map();
        users.users.forEach(user => {
          userMap.set(user.id, user);
        });
        
        habits.forEach(habit => {
          if (habit.related_user_id && userMap.has(habit.related_user_id)) {
            habit.user = userMap.get(habit.related_user_id);
          }
        });
      }
    }
  }

  return habits as Habit[];
}

export async function fetchUsers() {
  const {
    data: { users },
    error,
  } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    console.error("Error fetching users:", error);
    return null;
  }

  return users;
}

export async function fetchAdminStats(habits: Habit[] | null, users: User[] | null): Promise<AdminStats> {
  return {
    totalUsers: users?.length || 0,
    activeHabits: habits?.length || 0,
    completionRate: habits ? (habits.filter((h) => h.is_active).length / Math.max(habits.length, 1)) * 100 : 0,
  };
}
