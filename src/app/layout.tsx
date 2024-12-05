import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import Header from "@/components/header"

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased m-auto`}
      >
        <div className="m-auto">
          <Header />
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
