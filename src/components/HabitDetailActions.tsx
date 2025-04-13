"use client";

import { DeleteHabitButton } from "./DeleteHabitButton";
import { EditHabitButton } from "./EditHabitButton";

interface HabitDetailActionsProps {
  habitId: number;
}

export function HabitDetailActions({ habitId }: HabitDetailActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <EditHabitButton habitId={habitId} />
      <DeleteHabitButton habitId={habitId} />
    </div>
  );
} 