import { Settings, Activity, List as ListIcon, CalendarDays, BarChart2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import ProfileEditSheetServer from "@/components/profile-edit-sheet-server";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail } from "react-feather";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ADMIN } from "@/utils/validators/APIConstants";

export default async function Page() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-xl text-red-500">
          Hiba történt a felhasználói adatok betöltésekor.
        </p>
      </div>
    );
  }

  const user = data.user;
  const { user_metadata } = user;
  const isAdmin = user_metadata.role === ADMIN;
  const imgSrc = (!user_metadata.picture && !user_metadata.avatar_url)
    ? ""
    : user_metadata.picture || user_metadata.avatar_url;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-screen-lg">
        <Card className="bg-white dark:bg-zinc-950 shadow-2xl border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex gap-4 items-center">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                <AvatarImage src={imgSrc} alt="Avatar" />
                <AvatarFallback>
                  {user_metadata.name ? user_metadata.name.charAt(0) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <CardTitle className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
                  {user_metadata.name || "Név nem elérhető"}
                </CardTitle>
                <div className="flex flex-row items-center gap-2 mt-1 text-gray-600 dark:text-gray-300">
                  <Mail className="h-5 w-5 text-orange-700" />
                  <span>
                    {user.email ? user.email : <Skeleton className="w-40 h-4" />}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {isAdmin && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/admin">
                        <Button variant="outline" className="hover:text-orange-700 hover:border-orange-700 hover:border hover:shadow-xl p-2">
                          <Shield className="h-5 w-5" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">Admin vezérlőpult</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {await ProfileEditSheetServer()}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/settings">
                      <Button variant="outline" className="hover:text-orange-700 hover:border-orange-700 hover:border hover:shadow-xl p-2">
                        <Settings className="h-5 w-5" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Beállítások</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
              <Link href="/habits">
                <Button variant="secondary" className="flex flex-col items-center gap-1 p-6 rounded-lg shadow hover:bg-gray-100 dark:hover:bg-zinc-700 transition duration-300 font-bold w-full h-full border hover:shadow-xl hover:text-orange-700">
                  <Activity className="h-24 w-24" />
                  <span className="text-base">Szokások</span>
                </Button>
              </Link>
              <Link href="/lists">
                <Button variant="secondary" className="flex flex-col items-center gap-1 p-6 rounded-lg shadow hover:bg-gray-100 dark:hover:bg-zinc-700 transition duration-300 font-bold w-full h-full border hover:shadow-xl hover:text-orange-700">
                  <ListIcon className="h-24 w-24" />
                  <span className="text-base">Listák</span>
                </Button>
              </Link>
              <Link href="/habits/today">
                <Button variant="secondary" className="flex flex-col items-center gap-1 p-6 rounded-lg shadow hover:bg-gray-100 dark:hover:bg-zinc-700 transition duration-300 font-bold w-full h-full border hover:shadow-xl hover:text-orange-700">
                  <CalendarDays className="h-24 w-24" />
                  <span className="text-base">Napi nézet</span>
                </Button>
              </Link>
              <Link href="/statistics">
                <Button variant="secondary" className="flex flex-col items-center gap-1 p-6 rounded-lg shadow hover:bg-gray-100 dark:hover:bg-zinc-700 transition duration-300 font-bold w-full h-full border hover:shadow-xl hover:text-orange-700">
                  <BarChart2 className="h-24 w-24" />
                  <span className="text-base">Statisztika</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
