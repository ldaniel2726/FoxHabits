import { createClient } from "@/utils/supabase/server";
import { HabitCard } from "@/components/habit-card";

export default async function Page() {
    const supabase = await createClient();
    const { data: habits } = await supabase.from("habits").select(`
        *,
        habit_names!inner(habit_name)
    `);

    return (
        <div>
            <h1 className="text-4xl font-bold pt-12">Összes szokás</h1>
            <p className="text-lg pb-6 text-zinc-600">{habits?.length || 0} szokás található</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                {habits?.map((habit) => (
                    <HabitCard 
                        key={habit.habit_id}
                        habit_id={habit.habit_id}
                        habit_type={habit.habit_type}
                        interval={habit.interval}
                        habit_interval_type={habit.habit_interval_type}
                        start_date={habit.start_date}
                        is_active={habit.is_active}
                        created_date={habit.created_date}
                        habit_name_id={habit.habit_names.habit_name}
                    />
                ))}
            </div>
        </div>
    );
}
