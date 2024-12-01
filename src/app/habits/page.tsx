import { createClient } from "@/utils/supabase/server";
import { Card } from "@/components/ui/card";
import { HabitCard } from "@/components/habit-card";

export default async function Page() {
    const supabase = await createClient();
    const { data: habits } = await supabase.from("habits").select();

    return (
        <div>
            <h1 className="text-4xl font-bold pt-12">Összes szokás</h1>
            <p className="text-lg pb-6 text-zinc-600">{habits?.length || 0} szokás található</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                {habits?.map((habit) => (
                    HabitCard(habit)
                ))}
            </div>
        </div>
    );
}
