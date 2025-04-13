import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { lazy, Suspense } from 'react';
import LoadingFallback from '@/components/loading-fallback';
import { createClient } from "@/utils/supabase/server";
import { ThemeProvider } from "next-themes";

const fontSans = GeistSans;
const fontMono = GeistMono;

export const metadata: Metadata = {
  title: "FoxHabits",
  description: "A FoxHabits egy webalkalmazás, amely segít a felhasználóknak megfigyelni a szokásaikat és teendőiket.",
  icons: {
    icon: [
      { url: "/logo_transparent.svg", type: "image/svg+xml" },
      { url: "/logo_transparent.svg" }
    ],
    shortcut: "/logo_transparent.svg",
    apple: "/logo_transparent.svg",
  },
};

const Header = lazy(() => import('@/components/header'));

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  const { user } = data;

  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  return (
    <html lang="en" className={fontSans.className} suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} antialiased m-auto`}>
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme={settings?.dark_mode}>
          <Suspense fallback={<LoadingFallback />}>
            <div className="m-auto">
              <Header data={data} />
              {children}
            </div>
          </Suspense>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
