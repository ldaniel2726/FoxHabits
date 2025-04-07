import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { lazy, Suspense } from 'react';
import LoadingFallback from '@/components/loading-fallback';
import { createClient } from "@/utils/supabase/server";
import { ThemeProvider } from "next-themes";

const fontSans = GeistSans;
const fontMono = GeistMono;

export const metadata: Metadata = {
  title: "Fox Habits",
  description: "A Fox Habits egy webalkalmazás, amely segít a felhasználóknak megfigyelni a szokásaikat és teendőiket.",
};

const Header = lazy(() => import('@/components/header'));

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  return (
    <html lang="en" className={fontSans.className}>
      <body className={`${fontSans.variable} ${fontMono.variable} antialiased m-auto`}>
        <ThemeProvider attribute="class" defaultTheme="system">
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
