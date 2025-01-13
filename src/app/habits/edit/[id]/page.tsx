import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cookies } from "next/headers";
import HabitEditFormComponent from "@/components/habit-edit-form";

const formSchema = z.object({
  habit_name: z.string().min(1).max(255),
  habit_type: z.enum(["normal_habit", "bad_habit"]),
  interval: z.number().positive(),
  habit_interval_type: z.enum(["hours", "days", "weeks", "months", "years"]),
  start_date: z.string().datetime(),
  is_active: z.boolean(),
});

type FormSchema = z.infer<typeof formSchema>;

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
    return res.json();
}

export default async function HabitEditPage({ params }: { params: { id: string } }) {
    const { id } = params;
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
            <HabitEditFormComponent habit={habit} id={id} />
          </CardContent>
        </Card>
      </div>
    );
}
