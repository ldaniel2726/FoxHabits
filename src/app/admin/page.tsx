"use server";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, ClipboardList, Users } from "lucide-react";
import { fetchAdminStats, fetchHabits, fetchUsers } from "@/utils/admin-data";
import { HabitsTable } from "@/components/admin/HabitsTable";
import { UsersTable } from "@/components/admin/UsersTable";
import { AnalyticsPanel } from "@/components/admin/AnalyticsPanel";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { requireAdmin } from "@/utils/auth-checks";

export default async function AdminPage() {
  await requireAdmin();
  
  const habits = await fetchHabits();
  const users = await fetchUsers();
  const stats = await fetchAdminStats(habits, users);

  return (
    <div className="flex min-h-screen flex-col px-2 md:px-12 py-6">
      <AdminHeader />

      <main className="flex-1 py-8">
        <Tabs defaultValue="habits" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="habits" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span>Szokások</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Felhasználók</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span>Statisztikák</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="habits" className="space-y-4">
            <HabitsTable habits={habits} />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <UsersTable users={users} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsPanel stats={stats} users={users || []} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
