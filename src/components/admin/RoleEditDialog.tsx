"use client";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserRole } from "@/actions/user-actions";
import { toast } from "sonner";

interface RoleEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

type Role = "user" | "moderator" | "admin";

export function RoleEditDialog({
  isOpen,
  onClose,
  user,
  onSuccess,
}: RoleEditDialogProps) {
  const [selectedRole, setSelectedRole] = useState<Role>("user");
  const [currentRole, setCurrentRole] = useState<Role>("user");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      const userRole = (user.user_metadata?.role as Role) || "user";
      setCurrentRole(userRole);
      setSelectedRole(userRole);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user || selectedRole === currentRole) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateUserRole(user.id, selectedRole);
      if (result.success) {
        toast.success(
          `A felhasználó szerepköre sikeresen módosítva lett: ${getRoleLabel(
            selectedRole
          )}`
        );
        onSuccess();
        onClose();
      } else {
        toast.error(`Hiba történt: ${result.error}`);
      }
    } catch (error) {
      toast.error("Váratlan hiba történt a szerepkör módosítása során.");
      console.error("Error updating role:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleLabel = (role: Role): string => {
    switch (role) {
      case "admin":
        return "Admin";
      case "moderator":
        return "Moderátor";
      case "user":
        return "Felhasználó";
      default:
        return "Ismeretlen";
    }
  };

  const isUserAdmin = currentRole === "admin";

  const canSelectAdmin = !isUserAdmin;
  const canSelectModerator = !isUserAdmin;
  const canSelectUser = currentRole === "moderator";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Felhasználói szerepkör módosítása</DialogTitle>
          <DialogDescription>
            {user?.email || "Felhasználó"} szerepkörének módosítása.
            {isUserAdmin && (
              <span className="text-amber-500 mt-2">
                Figyelem: Admin felhasználók szerepköre nem módosítható.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isUserAdmin ? (
            <div className="flex items-center space-x-2 p-2 border rounded">
              <Label className="font-normal text-muted-foreground">
                Admin (nem módosítható)
              </Label>
            </div>
          ) : (
            <div className="space-y-4">
              <Label htmlFor="role-select">Szerepkör kiválasztása</Label>
              <Select
                defaultValue={currentRole}
                value={selectedRole}
                onValueChange={(value: string) => {
                  console.log("Selecting new role:", value);
                  setSelectedRole(value as Role);
                }}
                disabled={isUserAdmin}
              >
                <SelectTrigger id="role-select">
                  <SelectValue>
                    {getRoleLabel(selectedRole)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {canSelectUser && (
                    <SelectItem value="user">Felhasználó</SelectItem>
                  )}
                  <SelectItem value="moderator">Moderátor</SelectItem>
                  {canSelectAdmin && (
                    <SelectItem value="admin">Admin</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Mégsem
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting || selectedRole === currentRole || isUserAdmin
            }
          >
            {isSubmitting ? "Feldolgozás..." : "Mentés"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
