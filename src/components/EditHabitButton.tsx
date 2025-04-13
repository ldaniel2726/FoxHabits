"use client";

import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";

interface EditHabitButtonProps {
  habitId: number;
}

export function EditHabitButton({ habitId }: EditHabitButtonProps) {
  const router = useRouter();

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/habits/${habitId.toString()}/edit`);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleEdit}
      className="h-8 w-8 p-0 hover:text-blue-500 hover:bg-blue-500/10"
      title="Szokás szerkesztése"
    >
      <Edit className="h-4 w-4" />
      <span className="sr-only">Szokás szerkesztése</span>
    </Button>
  );
} 