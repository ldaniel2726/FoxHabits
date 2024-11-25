import { Moon, Sun, LogOut, Settings } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MapPin } from 'react-feather';
import { Skeleton } from "@/components/ui/skeleton";
import ProfileEditSheetServer from "@/components/profile-edit-sheet-server";
import { toast } from "sonner";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { createClient } from '@/utils/supabase/server';

export default async function Page() {
  
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  /*if (error || !data?.user) {
    redirect('/login')
  }*/

  return (
    <>
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex gap-4 items-center">
              <Avatar className="w-24 h-24">
                <AvatarImage src="https://github.com/shadcn.png" alt="User's avatar" />
                <AvatarFallback>LD</AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <CardTitle className="text-2xl">{data.user?.user_metadata.name}</CardTitle>
                <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 opacity-70" />
                    {data.user?.email ? (
                      data.user?.email
                    ) : (
                      <Skeleton className="w-40 h-4" />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <ProfileEditSheetServer />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">
                      <Settings />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-base">Beállítások</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="secondary" >
                      <LogOut />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-base">Kijelentkezés</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="streaks" className="w-full">
              <TabsList>
                <TabsTrigger value="streaks">Eredmények</TabsTrigger>
                <TabsTrigger value="public-habits">Publikus szokások</TabsTrigger>
              </TabsList>
              <TabsContent value="streaks">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl text-orange-700">Eredmények</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-4 space-y-2">
                      <li>Streak I.</li>
                      <li>Streak II.</li>
                      <li>Streak III.</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="public-habits">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl text-orange-700">Publikus szokások</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-4 space-y-2">
                      <li>Fogmosás :D</li>
                      <li>Fogmosás :D</li>
                      <li>Fogmosás :D</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
