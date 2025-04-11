export type HabitCardProps = {
    habit_id: string;
    habit_type: string;
    interval: number;
    habit_interval_type: string;
    start_date: string;
    is_active: boolean;
    created_date: string;
    habit_name_id: string;
    entries: Array<{
        entry_id: number;
        time_of_entry: string;
        entry_type: "done" | "skipped";
        datetime: string;
    }>;
}
