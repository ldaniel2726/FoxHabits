"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useEffect } from "react";

export default function Error({error, reset}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-[80vh] items-center justify-center px-6 py-24">
      <div className="text-center">
        <div className="bg-orange-100 dark:bg-zinc-800 rounded-full p-6 inline-block mb-6">
          <AlertTriangle className="w-16 h-16 text-orange-700" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Hiba történt!
        </h1>
        <p className="mt-6 mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
          <em>Kevés róka kerüli el a csávát.</em> <br />
          Valami hiba történt az oldal betöltésekor. <br />

        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button
            onClick={() => reset()}
            size="lg"
            variant="secondary"
            className="font-semibold"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Próbáld újra
          </Button>
          <Link href="/">
            <Button size="lg" className="font-semibold">
              <Home className="mr-2 h-4 w-4" />
              Vissza a főoldalra
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
