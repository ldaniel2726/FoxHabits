import { Moon, Sun, LogOut, Settings } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MapPin } from 'react-feather';
import { Skeleton } from "@/components/ui/skeleton";
import ProfileEditSheetServer from "@/components/profile-edit-sheet-server";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { createClient } from '@/utils/supabase/server';
import Link from "next/link";

export default async function Page() {
  
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  
  let imgSrc = ""

  if (!(data.user?.user_metadata.picture) && !(data.user?.user_metadata.avatar_url)) {
    imgSrc = "https://github.com/shadcn.png"
  } else {
    imgSrc = data.user?.user_metadata.picture || data.user?.user_metadata.avatar_url
  }

  return (
    <>
      <div className="container mx-auto py-2">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex gap-4 items-center">
              <Avatar className="w-24 h-24">
                <AvatarImage src={imgSrc} alt="Avatar" />
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
              {await ProfileEditSheetServer()}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/settings">
                      <Button variant="outline">
                        <Settings />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-base">Beállítások</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {/*<Button onClick={handleSignOut} variant="secondary" >
                      <LogOut />
                    </Button>*/}
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
