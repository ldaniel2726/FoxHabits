import Link from "next/link";
import Hero from "@/components/hero";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      <Hero />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mt-12">Üdv a Fox Habits-en!</h1>
        <p className="text-lg text-gray-600 mt-4">
          A Fox Habits egy webalkalmazás, amely segít a felhasználóknak
          megfigyelni a szokásaikat és teendőiket.
        </p>
        <div className="mt-8">
          <h2 className="text-2xl font-bold">Föbb funkciók</h2>
          <ul className="list-disc list-inside mt-4">
            <li>Kövesd nyomon a szokásaid!</li>
            <li>Állíts be emlékezetőket!</li>
            <li>Böngészd a statisztikát!</li>
          </ul>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-bold">Vágjunk bele.</h2>
          <p className="text-lg text-gray-600 mt-4">
            Regisztrálj, és kezdj el szokásokat hozzáadni, és kövesd azokat!
          </p>
          <div className="mt-4">
            <Link href="/signup">
              <Button>Regisztráció</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
