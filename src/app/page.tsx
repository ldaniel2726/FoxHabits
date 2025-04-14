import Link from "next/link";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCheck, Bell, BarChart3, ArrowRight, Lightbulb, Smile, Plus, Check, ChartBar, ListTodoIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
      <section className="bg-gradient-to-b from-white to-gray-200 dark:from-black dark:to-zinc-900 py-32 md:py-80">
          <div className="container mx-auto px-6 md:px-12 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Alakítsd ki az ideális szokásaidat a <span className="text-orange-700">FoxHabits</span> segítségével
            </h1>
            <p className="mt-6 mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Egyszerű és hatékony módszer a jó szokások kialakítására vagy a rossz
              szokások követésére.
            </p>
            {!user ? (
              <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/signup">
                  <Button size="lg" className="font-semibold">
                    Kezdj neki ingyen
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">
                    Bejelentkezés
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/habits">
                  <Button size="lg" className="font-semibold">
                    Szokásaim megtekintése
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="bg-gradient-to-bl from-sky-300/90 to-orange-500/90 dark:bg-zinc-950 pt-20 pb-24 px-6 md:px-12">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-orange-700">Hogyan működik?</h2>
            <p className="text-white text-lg dark:text-gray-300 mb-12 max-w-[700px] mx-auto">Három egyszerű lépésben kezdheted el az utadat a jobb szokások felé. Könnyen érthető és gyorsan beállítható!</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center bg-white dark:bg-zinc-950 shadow-xl border border-orange-700 rounded-lg p-6 transition transform hover:-translate-y-1 hover:shadow-2xl duration-300">
                <Plus className="w-16 h-16 mb-4 text-orange-700" />
                <h3 className="text-xl font-semibold mb-2">1. Regisztráció</h3>
                <p className="text-gray-600 dark:text-gray-300">Hozz létre egy fiókot néhány kattintással. Add meg céljaidat, és készen állsz a kezdésre!</p>
                  </div>
                  <div className="flex flex-col items-center bg-white dark:bg-zinc-950 shadow-xl border border-orange-700 rounded-lg p-6 transition transform hover:-translate-y-1 hover:shadow-2xl duration-300">
                    <Check className="w-16 h-16 mb-4 text-orange-700" />
                    <h3 className="text-xl font-semibold mb-2">2. Szokások hozzáadása</h3>
                    <p className="text-gray-600 dark:text-gray-300">Adj hozzá szokásokat, amelyeket követni szeretnél. Legyenek azok jó szokások vagy rosszak, amelyeket szeretnél leküzdeni.</p>
                  </div>
                  <div className="flex flex-col items-center bg-white dark:bg-zinc-950 shadow-xl border border-orange-700 rounded-lg p-6 transition transform hover:-translate-y-1 hover:shadow-2xl duration-300">
                <ChartBar className="w-16 h-16 mb-4 text-orange-700" />
                <h3 className="text-xl font-semibold mb-2">3. Követés és fejlődés</h3>
                <p className="text-gray-600 dark:text-gray-300">Kövesd nyomon a fejlődésedet vizuális statisztikákkal és emlékeztetőkkel, hogy mindig motivált maradj.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-zinc-950 py-20 px-6 md:px-12 mb-14">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold mb-20 text-orange-700">Főbb funkciók</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="shadow-lg transition transform hover:-translate-y-1 hover:shadow-2xl duration-300 border border-orange-700">
                <CardHeader>
                  <BadgeCheck className="w-12 h-12 text-orange-700 mb-4 mx-auto" />
                  <CardTitle>Szokások követése</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Kövesd nyomon napi, heti vagy havi szokásaidat. Állíts be célokat és érd el őket következetesen.</p>
                </CardContent>
                    </Card>
                    <Card className="shadow-lg transition transform hover:-translate-y-1 hover:shadow-2xl duration-300 border border-orange-700">
                <CardHeader>
                  <ListTodoIcon className="w-12 h-12 text-orange-700 mb-4 mx-auto" />
                  <CardTitle>Gyorslisták</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Vezesd egyszerűbb teendőidet gyorsan és hatékonyan a gyorslisták segítségével.</p>
                </CardContent>
                    </Card>
                    <Card className="shadow-lg transition transform hover:-translate-y-1 hover:shadow-2xl duration-300 border border-orange-700">
                <CardHeader>
                  <BarChart3 className="w-12 h-12 text-orange-700 mb-4 mx-auto" />
                  <CardTitle>Részletes statisztikák</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Elemezd fejlődésedet vizuális grafikonokkal és kövesd nyomon a hosszú távú eredményeidet.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-orange-900 to-orange-500 shadow-2xl text-white py-20 px-6 md:px-12">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold mb-12">Miért válaszd a FoxHabits-t?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-primary/5 text-gray-200 shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6 border-none">
                <CardHeader>
                  <Lightbulb className="w-12 h-12 mb-4 mx-auto" />
                  <CardTitle>Motiváció növelése</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>A vizuális statisztikák segítenek fenntartani a motivációdat és elérni céljaidat.</p>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 text-gray-200 shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6 border-none">
                <CardHeader>
                  <Smile className="w-12 h-12 mb-4 mx-auto" />
                  <CardTitle>Egyszerű használat</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>A felület intuitív és könnyen kezelhető, így mindenki számára elérhető.</p>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 text-gray-200 shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6 border-none">
                <CardHeader>
                  <BarChart3 className="w-12 h-12 mb-4 mx-auto" />
                  <CardTitle>Hosszú távú eredmények</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Segítünk abban, hogy ne csak elkezdj valamit, hanem hosszú távon is kitarts mellette.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="bg-gradient-to-b from-gray-300 to-gray-100 dark:text-white dark:from-zinc-950 dark:to-zinc-700 text-black py-40 px-6 md:px-12">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl md:text-4xl font-bold mb-6">Készen állsz a <span className="text-orange-700">változás</span>ra?</h2>
            <p className="text-lg md:text-xl mb-8 max-w-[600px] mx-auto">
              Csatlakozz most, és kezdd el felépíteni azokat a szokásokat, amelyek jobbá teszik az életed.
              Az első 30 nap teljesen ingyenes!
            </p>
            {user ? (
              <Link href="/habits">
                <Button size="lg" variant="secondary" className="font-semibold shadow-lg hover:shadow-xl">
                  Szokásaim megtekintése
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="font-semibold shadow-lg hover:shadow-xl">
                  Ingyenes regisztráció
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}