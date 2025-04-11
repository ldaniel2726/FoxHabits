import Link from "next/link";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { ServerCrash, Home, ArrowRight } from "lucide-react";

export default function ServerError() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <section className="bg-gradient-to-b from-white to-gray-200 dark:from-black dark:to-zinc-900 py-32 md:py-48">
          <div className="container mx-auto px-6 md:px-12 text-center">
            <ServerCrash className="w-24 h-24 mx-auto text-orange-700 mb-6" />
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              500 - A szerver rókaüregbe esett!
            </h1>
            <p className="mt-6 mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              A szerver úgy döntött, hogy egy kis szünetet tart. Valószínűleg épp rókakölykökkel játszik, vagy csak elment egy kis harapnivalóért.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/">
                <Button size="lg" className="font-semibold">
                  <Home className="mr-2 h-4 w-4" />
                  Vissza a főoldalra
                </Button>
              </Link>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                size="lg"
              >
                Próbáld újra
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
