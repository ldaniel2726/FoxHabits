import Link from "next/link";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { FrownIcon, Home, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function NotFound() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <section className="bg-gradient-to-b from-gray-300 to-gray-100 dark:from-black dark:to-zinc-900 py-32 md:py-48">
          <div className="container mx-auto px-6 md:px-12 text-center">
            <FrownIcon className="w-24 h-24 mx-auto text-orange-700 mb-6" />
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              404 - A róka eltévedt!
            </h1>
            <p className="mt-6 mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Hoppá! Úgy tűnik, hogy egy nem létező oldalt keresel. Talán a róka elrejtette, vagy csak eltévedtél az erdőben?
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/">
                <Button size="lg" className="font-semibold">
                  <Home className="mr-2 h-4 w-4" />
                  Vissza a főoldalra
                </Button>
              </Link>
              {user ? (
                <Link href="/habits">
                  <Button variant="outline" size="lg">
                    Szokásaim
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button variant="outline" size="lg">
                    Bejelentkezés
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
