import type { Metadata } from "next";
import localFont from "@next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { lazy, Suspense } from 'react';
import LoadingFallback from '@/components/loading-fallback';
import { createClient } from "@/utils/supabase/server";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

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
    <html lang="en" className={geistSans.className}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased m-auto`}>
        <Suspense fallback={<LoadingFallback />}>
          <div className="m-auto">
            <Header data={data} />
            {children}
          </div>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
