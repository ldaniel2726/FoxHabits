import { calculateHabitStreak } from "@/utils/habit-utils"
import { expect, test } from "vitest";

let habitWithStreak = {
    habit_id: 16,
    habit_interval_type: 'days' as const,
    interval: 1,
    start_date: '2025-02-03T17:15:00+00:00',
    is_active: true,
    habit_type: 'normal_habit' as const,
    habit_names: { habit_name: 'Fogmosás' },
    entries: [
        {
            datetime: '2025-02-05T20:56:04.559',
            entry_id: 13,
            habit_id: 16,
            entry_type: 'done' as const,
            time_of_entry: '2025-03-02T20:56:04.338+00:00'
        },
        {
            datetime: '2025-02-06T20:56:04.559',
            entry_id: 14,
            habit_id: 16,
            entry_type: 'done' as const,
            time_of_entry: '2025-03-02T20:56:04.338+00:00'
        },
        {
            datetime: '2025-02-07T20:56:04.559',
            entry_id: 15,
            habit_id: 16,
            entry_type: 'done' as const,
            time_of_entry: '2025-03-02T20:56:04.338+00:00'
        }

    ]
}


test('Check habit with 3 days streak on the last log`s date', () => {
    const streakResult = calculateHabitStreak(
        habitWithStreak, new Date('2025-02-07T01:00:00+00:00')
    )
    expect(streakResult).toBe(3);
});

test('Check the habit by 3 days a day after the last log date.', () => {
    const streakResult = calculateHabitStreak(
        habitWithStreak, new Date('2025-02-08T01:00:00+00:00')
    )
    expect(streakResult).toBe(3);
});

test('Check the habit by 3 days, two day after the last log date.', () => {
    const streakResult = calculateHabitStreak(
        habitWithStreak, new Date('2025-02-09T01:00:00+00:00')
    )
    expect(streakResult).toBe(0);
});