import { HabitCard } from "@/components/habit-card";
import { createClient } from "@/utils/supabase/server";

export default async function Page() {
    const supabase = await createClient();
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    const response = await fetch(`${protocol}://${host}/api/habits/own`);
    const result = await response.json();
    console.log(result);

    if (result.message) {
        return (
            <div className="mx-14 py-10">
                <h1 className="text-4xl font-bold pt-12">Összes szokásod</h1>
                <p className="text-lg pb-6 text-zinc-600">{result.message}</p>
            </div>
        );
    } else if (result.error) {
        return (
            <div className="mx-14 py-10">
                <h1 className="text-4xl font-bold pt-12">Összes szokásod</h1>
                <p className="text-lg pb-6 text-zinc-600">{result.error}</p>
            </div>
        );
    }

    const { data: habits } = result;

    return (
        <div className="mx-14 py-10">
            <h1 className="text-4xl font-bold pt-12">Összes szokásod</h1>
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