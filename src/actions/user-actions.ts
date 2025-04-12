"use server";

import { supabaseAdmin } from "@/utils/supabase/admin";
import { ExtendedUser } from "@/types/ExtendedUser";

export async function banUser(userId: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        ban_duration: "876000h"
      }
    );

    if (error) {
      console.error("Error banning user:", error);
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user as ExtendedUser };
  } catch (error) {
    console.error("Error in banUser:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function unbanUser(userId: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        ban_duration: "none"
      }
    );

    if (error) {
      console.error("Error unbanning user:", error);
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user as ExtendedUser };
  } catch (error) {
    console.error("Error in unbanUser:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateUserRole(userId: string, role: 'user' | 'moderator' | 'admin') {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          role: role
        }
      }
    );

    if (error) {
      console.error("Error updating user role:", error);
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      user: data.user as ExtendedUser 
    };
  } catch (error) {
    console.error("Error in updateUserRole:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
