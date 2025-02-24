import { createClient } from "@/utils/supabase/server";
import { HabitCard } from "@/components/habit-card";
import { getTodayHabits } from "./actions";

export default async function Page() {
    const { habits, dayOfWeek } = await getTodayHabits();

    let day = "";

    switch (dayOfWeek) {
        case 0:
            day = "vasárnap"
            break
        case 1:
            day = "hétfő"
            break
        case 2:
            day = "kedd"
            break
        case 3:
            day = "szerda"
            break
        case 4:
            day = "csütörtök"
            break
        case 5:
            day = "péntek"
            break
        case 6:
            day = "szombat"
            break
    }

    return (
        <div className="mx-14 py-10">
            <h1 className="text-4xl font-bold pt-12">Napi nézet - {day}</h1>
            <p className="text-lg pb-6 text-zinc-600">{habits?.length || 0} szokás található</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                {habits?.map((habit) => (
                    <HabitCard key={habit.habit_id} {...habit} />
                ))}
            </div>
        </div>
    );
}
