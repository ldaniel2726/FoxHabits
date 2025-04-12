"use client"

import { User } from "@supabase/supabase-js";
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

interface UsersTableProps {
  users: User[] | null;
}

export function UsersTable({ users }: UsersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const filteredUsers = users?.filter((user) => {
    const nameMatch = (user.user_metadata?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = (user.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const searchMatch = nameMatch || emailMatch;
    
    let roleMatch = true;
    if (roleFilter === "admin") {
      roleMatch = user.user_metadata?.role === "admin";
    } else if (roleFilter === "user") {
      roleMatch = !user.user_metadata?.role || user.user_metadata?.role === "user";
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

  return (
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
          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Szerep szerint" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Összes</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">Felhasználó</SelectItem>
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
                    <TableHead className="w-[100px] px-4 py-3">Műveletek</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium px-4 py-3">
                        {user.user_metadata?.full_name || "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3">{user.email}</TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge variant="outline" className="font-medium">
                          {user.user_metadata?.role || "Felhasználó"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="flex items-center cursor-pointer">
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Szerkesztés</span>
                            </DropdownMenuItem>
                            {(!user.user_metadata?.role || user.user_metadata?.role !== "admin") && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive flex items-center cursor-pointer">
                                  <Trash className="mr-2 h-4 w-4" />
                                  <span>Deaktiválás</span>
                                </DropdownMenuItem>
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
                        <h3 className="font-medium">
                          {user.email || "—"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="font-medium">
                            {user.user_metadata?.role || "Felhasználó"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ChevronDown className={`h-4 w-4 transition-transform ${expandedUser === user.id ? "transform rotate-180" : ""}`} />
                          </Button>
                        </CollapsibleTrigger>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="flex items-center cursor-pointer">
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Szerkesztés</span>
                            </DropdownMenuItem>
                            {(!user.user_metadata?.role || user.user_metadata?.role !== "admin") && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive flex items-center cursor-pointer">
                                  <Trash className="mr-2 h-4 w-4" />
                                  <span>Deaktiválás</span>
                                </DropdownMenuItem>
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
                          <p>{user.user_metadata?.full_name || "—"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Létrehozva:</p>
                          <p>{new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
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
  );
}
