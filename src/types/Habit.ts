export type Habit = {
    habit_id: number;
    habit_type: 'normal_habit' | 'bad_habit';
    interval: number;
    habit_interval_type: 'days' | 'weeks' | 'months' | 'years';
    start_date: string;
    is_active: boolean;
    created_date: string;
    related_user_id?: string;
    habit_names: {
      habit_name: string;
      habit_name_id: string;
      habit_name_status: string;
    };
    user?: {
      id: string;
      email: string;
      user_metadata?: {
        name?: string;
        role?: string;
      };
    };
    entries: Array<{
      entry_id: number;
      time_of_entry: string;
      entry_type: "done" | "skipped";
      datetime: string;
    }>;
}
