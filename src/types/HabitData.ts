export type HabitData = {
    habit_id: string;
    habit_type: string;
    interval: number;
    habit_interval_type: string;
    start_date: string;
    is_active: boolean;
    habit_names: {
      habit_name: string;
    };
}
