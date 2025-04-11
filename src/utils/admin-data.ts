"use server";

import { supabaseAdmin } from "@/utils/supabase/admin";
import { AdminStats } from "@/types/AdminStats";
import { Habit } from "@/types/Habit";
import { User } from "@supabase/supabase-js";

export async function fetchHabits() {
  const { data: habits, error } = await supabaseAdmin
    .from("habits")
    .select("*")
    .order("created_date");

  if (error) {
    console.error("Error fetching habits:", error);
    return null;
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
