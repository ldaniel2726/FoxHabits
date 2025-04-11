import Link from "next/link";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { ShieldAlert, Home, ArrowRight } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <section className="bg-gradient-to-b from-white to-gray-200 dark:from-black dark:to-zinc-900 py-32 md:py-48">
          <div className="container mx-auto px-6 md:px-12 text-center">
            <ShieldAlert className="w-24 h-24 mx-auto text-orange-700 mb-6" />
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              403 - A róka nem enged be!
            </h1>
            <p className="mt-6 mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Úgy tűnik, nincs jogosultságod ehhez az oldalhoz. A róka őrzi a kerítést, és nem enged be senkit megfelelő belépőjegy nélkül.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/">
                <Button size="lg" className="font-semibold">
                  <Home className="mr-2 h-4 w-4" />
                  Vissza a főoldalra
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Bejelentkezés
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
