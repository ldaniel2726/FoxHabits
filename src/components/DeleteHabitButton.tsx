"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { HabitDeleteConfirmationModal } from "./HabitDeleteConfirmationModal";

interface DeleteHabitButtonProps {
  habitId: number;
  onDelete?: () => void;
}

export function DeleteHabitButton({ habitId, onDelete }: DeleteHabitButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const router = useRouter();

  const openConfirmModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsConfirmOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmOpen(false);
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/habits/${Number(habitId)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Hiba történt a szokás törlésekor");
      }

      toast.success("Szokás sikeresen törölve");
      
      if (onDelete) {
        onDelete();
      } else {
        router.push("/habits");
        router.refresh();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error instanceof Error ? error.message : "Hiba történt a szokás törlésekor");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={openConfirmModal}
        disabled={isDeleting}
        className="h-8 w-8 p-0 hover:text-destructive hover:bg-destructive/10"
        title="Szokás törlése"
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Szokás törlése</span>
      </Button>

      <HabitDeleteConfirmationModal
        isOpen={isConfirmOpen}
        onClose={closeConfirmModal}
        onConfirm={handleDelete}
      />
    </>
  );
}