"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateHabitStatus(
  habitNameId: string,
  newStatus: "new" | "private" | "rejected" | "approved"
) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("habit_names")
      .update({ habit_name_status: newStatus })
      .eq("habit_name_id", habitNameId);

    if (error) {
      console.error("Error updating habit status:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Unexpected error updating habit status:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
