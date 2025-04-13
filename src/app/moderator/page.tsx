"use server";

import { fetchHabits } from "@/utils/admin-data";
import { HabitsTable } from "@/components/admin/HabitsTable";
import { ModeratorHeader } from "@/components/moderator/ModeratorHeader";
import { requireModerator } from "@/utils/auth-checks";

export default async function ModeratorPage() {
  await requireModerator();
  
  const habits = await fetchHabits();

  return (
    <div className="flex min-h-screen flex-col px-2 md:px-12 py-6">
      <ModeratorHeader />

      <main className="flex-1 py-8">
        <HabitsTable habits={habits} />
      </main>
    </div>
  );
}
