"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";

interface DeleteEntryButtonProps {
  entryId: number;
  onDelete: () => void;
}

export function DeleteEntryButton({ entryId, onDelete }: DeleteEntryButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/entries/${entryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Hiba történt a bejegyzés törlésekor");
      }

      toast.success("Bejegyzés sikeresen törölve");
      onDelete();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error instanceof Error ? error.message : "Hiba történt a bejegyzés törlésekor");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
      title="Bejegyzés törlése"
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Bejegyzés törlése</span>
    </Button>
  );
} 