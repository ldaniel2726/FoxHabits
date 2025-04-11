import { AdminStats } from "@/types/AdminStats";
import { User } from "@supabase/supabase-js";
import { CompletionPieChart } from "./CompletionPieChart";
import { UserGrowthLineChart } from "./UserGrowthLineChart";

interface AnalyticsPanelProps {
  stats: AdminStats;
  users: User[];
}

export function AnalyticsPanel({ stats, users }: AnalyticsPanelProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <CompletionPieChart completionRate={stats.completionRate} activeHabits={stats.activeHabits} />
      <UserGrowthLineChart users={users} />
    </div>
  );
}
