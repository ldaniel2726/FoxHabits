import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cookies } from "next/headers";
import HabitEditFormComponent from "@/components/habit-edit-form";
import { habitFormSchema } from "@/types/HabitFormSchema";

type FormSchema = z.infer<typeof habitFormSchema>;

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getHabit(id: string): Promise<FormSchema> {
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const host = process.env.VERCEL_URL || "localhost:3000";
    const cookieStore = cookies();
    
    const res = await fetch(`${protocol}://${host}/api/habits/${id}`, {
        headers: {
            Cookie: cookieStore.toString(),
        },
        cache: 'no-store'
    });

    if (!res.ok) {
        throw new Error('Nem sikerült lekérni a szokás adatait');
    }
    
    const result = await res.json();
    return result.data;
}

export default async function HabitEditPage({ params }: PageProps) {
  const { id } = await params;
  let habit: FormSchema | null = null;
  let error: string | null = null;

  try {
    habit = await getHabit(id);
  } catch (err) {
    console.error("Hiba a szokás adatainak lekérésekor:", err);
    error = 'Nem sikerült betölteni a szokás adatait.';
  }

  if (error) return <div>{error}</div>;
  if (!habit) return <div>Nem található szokás.</div>;

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Szokás szerkesztése</CardTitle>
          <CardDescription>Szerkeszd a szokásod részleteit alább.</CardDescription>
        </CardHeader>
        <CardContent>
          <HabitEditFormComponent habit={{ ...habit, is_active: habit.is_active ?? false }} id={id} />
        </CardContent>
      </Card>
    </div>
  );
}
