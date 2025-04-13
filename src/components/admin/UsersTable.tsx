"use client";

import { User } from "@supabase/supabase-js";
import { ExtendedUser } from "@/types/ExtendedUser";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Pencil,
  Search,
  Trash,
  Users as UsersIcon,
  ChevronDown,
  ShieldAlert,
  ShieldCheck,
  Shield,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ConfirmationModal } from "./ConfirmationModal";
import { RoleEditDialog } from "./RoleEditDialog";
import { banUser, unbanUser } from "@/actions/user-actions";
import { useRouter } from "next/navigation";

interface UsersTableProps {
  users: User[] | null;
}

export function UsersTable({ users }: UsersTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    userId: string | null;
    isBanning: boolean;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    isBanning: true,
    userName: "",
  });
  const [roleEditState, setRoleEditState] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null,
  });

  const isUserBanned = (user: User): boolean => {
    const extendedUser = user as ExtendedUser;
    if (!extendedUser.banned_until) return false;

    try {
      const banDate = new Date(extendedUser.banned_until);
      return banDate > new Date();
    } catch (error) {
      console.error("Error parsing banned_until date:", error);
      return false;
    }
  };

  const filteredUsers = users?.filter((user) => {
    const nameMatch = (user.user_metadata?.name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const emailMatch = (user.email || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const searchMatch = nameMatch || emailMatch;

    let roleMatch = true;
    if (roleFilter === "admin") {
      roleMatch = user.user_metadata?.role === "admin";
    } else if (roleFilter === "moderator") {
      roleMatch = user.user_metadata?.role === "moderator";
    } else if (roleFilter === "user") {
      roleMatch =
        (!user.user_metadata?.role || user.user_metadata?.role === "user") &&
        !isUserBanned(user);
    } else if (roleFilter === "banned") {
      roleMatch = isUserBanned(user);
    }

    return searchMatch && roleMatch;
  });

  const toggleExpand = (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
    }
  };

  const openBanModal = (userId: string, userName: string) => {
    setModalState({
      isOpen: true,
      userId,
      isBanning: true,
      userName,
    });
  };

  const openUnbanModal = (userId: string, userName: string) => {
    setModalState({
      isOpen: true,
      userId,
      isBanning: false,
      userName,
    });
  };

  const openRoleEditDialog = (user: User) => {
    setRoleEditState({
      isOpen: true,
      user,
    });
  };

  const closeRoleEditDialog = () => {
    setRoleEditState({
      isOpen: false,
      user: null,
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirmAction = async () => {
    if (!modalState.userId) return;

    try {
      if (modalState.isBanning) {
        await banUser(modalState.userId);
      } else {
        await unbanUser(modalState.userId);
      }
      router.refresh();
    } catch (error) {
      console.error("Error performing user action:", error);
    }
  };

  const getUserRoleBadge = (user: User) => {
    if (isUserBanned(user)) {
      return (
        <Badge variant="destructive" className="font-medium">
          <ShieldAlert className="h-3 w-3 mr-1" />
          Tiltott
        </Badge>
      );
    } else if (user.user_metadata?.role === "admin") {
      return (
        <Badge variant="default" className="font-medium bg-blue-500">
          <ShieldCheck className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      );
    } else if (user.user_metadata?.role === "moderator") {
      return (
        <Badge variant="default" className="font-medium bg-green-500">
          <Shield className="h-3 w-3 mr-1" />
          Moderátor
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="font-medium">
          Felhasználó
        </Badge>
      );
    }
  };

  const formatBanDate = (user: User | ExtendedUser): string => {
    try {
      const extendedUser = user as ExtendedUser;
      if (extendedUser.banned_until) {
        return new Date(extendedUser.banned_until).toLocaleDateString();
      }
      return "—";
    } catch (error) {
      console.error("Error formatting ban date:", error);
      return "—";
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Felhasználók kezelése</CardTitle>
          </div>
        </CardHeader>
        <div className="px-4 py-3 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Felhasználó keresése..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Szerep szerint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Összes</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderátor</SelectItem>
                <SelectItem value="user">Felhasználó</SelectItem>
                <SelectItem value="banned">Tiltott</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardContent className="p-0">
          {filteredUsers?.length ? (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4 py-3">Név</TableHead>
                      <TableHead className="px-4 py-3">Email</TableHead>
                      <TableHead className="px-4 py-3">Szerep</TableHead>
                      <TableHead className="w-[100px] px-4 py-3">
                        Műveletek
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers?.map((user) => (
                      <TableRow
                        key={user.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium px-4 py-3">
                          {user.user_metadata?.name || "—"}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {user.email}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {getUserRoleBadge(user)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                className="flex items-center cursor-pointer"
                                onClick={() => openRoleEditDialog(user)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Szerepkör módosítása</span>
                              </DropdownMenuItem>
                              {(!user.user_metadata?.role ||
                                user.user_metadata?.role !== "admin") && (
                                <>
                                  <DropdownMenuSeparator />
                                  {isUserBanned(user) ? (
                                    <DropdownMenuItem
                                      className="text-green-600 focus:text-green-600 flex items-center cursor-pointer"
                                      onClick={() =>
                                        openUnbanModal(
                                          user.id,
                                          user.email || "felhasználó"
                                        )
                                      }
                                    >
                                      <ShieldCheck className="mr-2 h-4 w-4" />
                                      <span>Tiltás feloldása</span>
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive flex items-center cursor-pointer"
                                      onClick={() =>
                                        openBanModal(
                                          user.id,
                                          user.email || "felhasználó"
                                        )
                                      }
                                    >
                                      <ShieldAlert className="mr-2 h-4 w-4" />
                                      <span>Tiltás</span>
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden">
                <div className="divide-y">
                  {filteredUsers?.map((user) => (
                    <Collapsible
                      key={user.id}
                      open={expandedUser === user.id}
                      onOpenChange={() => toggleExpand(user.id)}
                      className="px-4 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{user.email || "—"}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getUserRoleBadge(user)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${
                                  expandedUser === user.id
                                    ? "transform rotate-180"
                                    : ""
                                }`}
                              />
                            </Button>
                          </CollapsibleTrigger>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                className="flex items-center cursor-pointer"
                                onClick={() => openRoleEditDialog(user)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Szerepkör módosítása</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {(!user.user_metadata?.role ||
                                user.user_metadata?.role !== "admin") && (
                                <>
                                  {isUserBanned(user) ? (
                                    <DropdownMenuItem
                                      className="text-green-600 focus:text-green-600 flex items-center cursor-pointer"
                                      onClick={() =>
                                        openUnbanModal(
                                          user.id,
                                          user.email || "felhasználó"
                                        )
                                      }
                                    >
                                      <ShieldCheck className="mr-2 h-4 w-4" />
                                      <span>Tiltás feloldása</span>
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive flex items-center cursor-pointer"
                                      onClick={() =>
                                        openBanModal(
                                          user.id,
                                          user.email || "felhasználó"
                                        )
                                      }
                                    >
                                      <ShieldAlert className="mr-2 h-4 w-4" />
                                      <span>Tiltás</span>
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <CollapsibleContent className="mt-2 space-y-2">
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Név:</p>
                            <p>{user.user_metadata?.name || "—"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Létrehozva:</p>
                            <p>
                              {new Date(user.created_at).toLocaleDateString(
                                "hu-HU"
                              )}
                            </p>
                          </div>
                          {isUserBanned(user) && (
                            <div>
                              <p className="text-muted-foreground">Tiltás lejárata:</p>
                              <p>{formatBanDate(user)}</p>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UsersIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nincsenek felhasználók</h3>
              <p className="text-muted-foreground mt-2 mb-4">
                {searchQuery || roleFilter !== "all"
                  ? "Nincs találat a keresési feltételeknek megfelelően."
                  : "Még nincsenek regisztrált felhasználók a rendszerben."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={handleConfirmAction}
        title={
          modalState.isBanning ? "Felhasználó tiltása" : "Tiltás feloldása"
        }
        description={
          modalState.isBanning
            ? `Biztosan le szeretné tiltani a következő felhasználót: ${modalState.userName}? A felhasználó nem fog tudni bejelentkezni a fiókjába.`
            : `Biztosan fel szeretné oldani a következő felhasználó tiltását: ${modalState.userName}?`
        }
        confirmText={modalState.isBanning ? "Tiltás" : "Feloldás"}
        cancelText="Mégsem"
        variant={modalState.isBanning ? "destructive" : "default"}
      />

      <RoleEditDialog
        isOpen={roleEditState.isOpen}
        onClose={closeRoleEditDialog}
        user={roleEditState.user}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </>
  );
}
