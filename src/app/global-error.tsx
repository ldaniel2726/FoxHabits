"use client"

import { Button } from "@/components/ui/button";
import { AlertOctagon, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function GlobalError({error, reset}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="bg-gradient-to-b from-white to-gray-200 dark:from-black dark:to-zinc-900">
        <div className="flex flex-col min-h-screen items-center justify-center px-6 py-24">
          <div className="text-center">
            <div className="bg-orange-100 dark:bg-zinc-800 rounded-full p-6 inline-block mb-6">
              <AlertOctagon className="w-16 h-16 text-orange-700" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Kritikus hiba!
            </h1>
            <p className="mt-6 mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Úgy tűnik, a Fox Habits alkalmazás most épp szundikál. Lehet, hogy rókák nem dolgoznak éjszaka?
              Vagy talán csak túl sok kávét ivott, és most túlterhelt.
            </p>
            <div className="mt-8 flex justify-center">
              <Button
                onClick={() => reset()}
                size="lg"
                className="font-semibold"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Frissítsd az oldalt
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
