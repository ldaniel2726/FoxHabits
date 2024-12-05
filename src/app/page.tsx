import Link from "next/link";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCheck, Bell, BarChart3, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <section className="bg-gradient-to-b from-primary/10 to-background py-64">
          <div className="px-12 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Alakítsd ki az ideális szokásaidat a{" "}
                <span className="text-primary">Fox Habits</span> segítségével
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Egyszerű és hatékony módszer a jó szokások kialakítására vagy a rossz szokások követésére.
              </p>
              <div className="space-x-4">
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
            </div>
          </div>
        </section>

        <section className="px-12 py-32">
          <h2 className="text-3xl font-bold text-center mb-12">Főbb funkciók</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <BadgeCheck className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Szokások követése</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Kövesd nyomon napi, heti vagy havi szokásaidat. 
                  Állíts be célokat és érd el őket következetesen.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Bell className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Emlékeztetők</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Személyre szabott értesítések, hogy soha ne feledkezz meg 
                  a kitűzött céljaidról és feladataidról.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <BarChart3 className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Részletes statisztikák</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Elemezd fejlődésedet vizuális grafikonokkal és 
                  kövesd nyomon a hosszú távú eredményeidet.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="px-12 py-32">
          <Card className="bg-primary/5 border-0">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">
                Készen állsz a változásra?
              </h2>
              <p className="text-gray-500 mb-6 max-w-[600px] mx-auto">
                Csatlakozz most, és kezdd el felépíteni azokat a szokásokat, 
                amelyek jobbá teszik az életed. Az első 30 nap teljesen ingyenes!
              </p>
              <Link href="/signup">
                <Button size="lg" className="font-semibold">
                  Ingyenes regisztráció
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
