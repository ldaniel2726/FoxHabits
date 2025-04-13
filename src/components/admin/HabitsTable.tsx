"use client"

import { Habit } from "@/types/Habit";
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
import Link from "next/link";
import {
  ClipboardX,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash,
  ChevronDown,
  BookOpenCheck
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
import { updateHabitStatus } from "@/actions/habit-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const translateHabitType = (type: string): string => {
  const translations: Record<string, string> = {
    normal_habit: "Normál szokás",
    bad_habit: "Ártó szokás"
  };
  
  return translations[type] || type;
};

interface HabitsTableProps {
  habits: Habit[] | null;
}

interface GroupedHabit extends Habit {
  users: Array<{
    id: string;
    email: string;
    user_metadata?: {
      name?: string;
      role?: string;
    };
  }>;
  originalHabits: Habit[];
}

export function HabitsTable({ habits }: HabitsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedHabit, setExpandedHabit] = useState<number | null>(null);
  const router = useRouter();

  const initialFilteredHabits = habits?.filter((habit) => {
    const nameMatch = habit.habit_names?.habit_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let statusMatch = true;
    if (statusFilter === "active") {
      statusMatch = habit.is_active === true;
    } else if (statusFilter === "inactive") {
      statusMatch = habit.is_active === false;
    }
    
    return nameMatch && statusMatch;
  });

  const groupedHabits = initialFilteredHabits?.reduce((acc, habit) => {
    const habitName = habit.habit_names?.habit_name;
    if (!habitName) return acc;
    
    if (!acc[habitName]) {
      acc[habitName] = {
        ...habit,
        users: habit.user ? [habit.user] : [],
        originalHabits: [habit]
      };
    } else {
      if (habit.user && !acc[habitName].users.some((u: {id: string}) => u.id === habit.user?.id)) {
        acc[habitName].users.push(habit.user);
      }
      acc[habitName].originalHabits.push(habit);
    }
    
    return acc;
  }, {} as Record<string, GroupedHabit>) || {};

  const filteredHabits = Object.values(groupedHabits) as GroupedHabit[];

  const toggleCollapsible = (habitId: number) => {
    if (expandedHabit === habitId) {
      setExpandedHabit(null);
    } else {
      setExpandedHabit(habitId);
    }
  };

  const handleStatusUpdate = async (habit: Habit | GroupedHabit, newStatus: "approved" | "private") => {
    const habitsToUpdate = 'originalHabits' in habit ? habit.originalHabits : [habit];
    const habitNameIds = habitsToUpdate.map((h: Habit) => h.habit_names?.habit_name_id).filter(Boolean);
    
    if (habitNameIds.length === 0) {
      toast.error("Hiányzó szokás azonosító");
      return;
    }
    
    try {
      const updatePromises = habitNameIds.map((habitNameId: string) => 
        updateHabitStatus(habitNameId, newStatus)
      );
      
      const results = await Promise.all(updatePromises);
      
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        toast.success(
          newStatus === "approved" 
            ? "A szokás(ok) sikeresen publikussá lett(ek) téve" 
            : "A szokás(ok) sikeresen priváttá lett(ek) téve"
        );
        router.refresh();
      } else {
        const errorMessage = results.find(r => !r.success)?.error || "Ismeretlen hiba";
        toast.error(`Hiba történt: ${errorMessage}`);
      }
    } catch (error) {
      toast.error("Váratlan hiba történt a státusz módosítása során");
      console.error("Error updating habit status:", error);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Publikus szokások kezelése</CardTitle>
          <Link href="/habits/add">
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Új szokás
            </Button>
          </Link>
        </div>
      </CardHeader>
      <div className="px-4 py-3 border-b">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Szokás keresése..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Státusz szerint" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Összes</SelectItem>
              <SelectItem value="active">Aktív</SelectItem>
              <SelectItem value="inactive">Inaktív</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <CardContent className="p-0">
        {filteredHabits?.length ? (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 py-3">Név</TableHead>
                    <TableHead className="px-4 py-3">Típus</TableHead>
                    <TableHead className="px-4 py-3">Felhasználó</TableHead>
                    <TableHead className="px-4 py-3">Létrehozva</TableHead>
                    <TableHead className="px-4 py-3">Státusz</TableHead>
                    <TableHead className="w-[100px] px-4 py-3">Műveletek</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHabits?.map((habit: GroupedHabit) => (
                    <TableRow key={habit.habit_id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium px-4 py-3">
                        {habit.habit_names?.habit_name || `ID: ${habit.habit_id}`}  
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge
                          variant={habit.habit_type === "bad_habit" ? "destructive" : "outline"}
                          className={`font-medium text-black ${habit.habit_type === "normal_habit" ? "border-green-700 text-gray-900 dark:text-white" : "text-white"}`}
                        >
                          {translateHabitType(habit.habit_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {habit.users && habit.users.length > 0 ? (
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {habit.users.length > 1 ? 
                                `${habit.users.length} felhasználó` : 
                                habit.users[0].user_metadata?.name || "-"}
                            </span>
                            {habit.users.length === 1 && habit.users[0].email && (
                              <span className="text-xs text-muted-foreground">
                                {habit.users[0].email}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {habit.created_date.toString().split("T")[0]}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            habit.habit_names?.habit_name_status === "approved" ? "success" :
                            habit.habit_names?.habit_name_status === "private" ? "secondary" :
                            habit.habit_names?.habit_name_status === "new" ? "primary" : "default"
                          }
                          className="font-medium"
                        >
                          {habit.habit_names?.habit_name_status === "new" ? "Új" :
                          habit.habit_names?.habit_name_status === "private" ? "Privát" :
                          habit.habit_names?.habit_name_status === "rejected" ? "Elutasított" :
                          habit.habit_names?.habit_name_status === "approved" ? "Publikus" :
                          "Ismeretlen"}
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
                            <DropdownMenuItem 
                              className="text-green-600 focus:text-green-600 flex items-center cursor-pointer"
                              onClick={() => handleStatusUpdate(habit, "approved")}
                            >
                              <BookOpenCheck className="mr-2 h-4 w-4" />
                              <span>Publikussá alakítás</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive flex items-center cursor-pointer"
                              onClick={() => handleStatusUpdate(habit, "private")}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Priváttá alakítás</span>
                            </DropdownMenuItem>
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
                {filteredHabits?.map((habit: GroupedHabit) => (
                  <Collapsible
                    key={habit.habit_id}
                    open={expandedHabit === habit.habit_id}
                    onOpenChange={() => toggleCollapsible(habit.habit_id)}
                    className="px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {habit.habit_names?.habit_name || `ID: ${habit.habit_id}`}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={habit.is_active ? "success" : "secondary"} className="font-medium">
                            {habit.is_active ? "Aktiv" : "Inaktív"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {habit.created_date.toString().split("T")[0]}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ChevronDown className={`h-4 w-4 transition-transform ${expandedHabit === habit.habit_id ? "transform rotate-180" : ""}`} />
                          </Button>
                        </CollapsibleTrigger>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="text-green-600 focus:text-green-600 flex items-center cursor-pointer"
                              onClick={() => handleStatusUpdate(habit, "approved")}
                            >
                              <BookOpenCheck className="mr-2 h-4 w-4" />
                              <span>Publikussá alakítás</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive flex items-center cursor-pointer"
                              onClick={() => handleStatusUpdate(habit, "private")}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Priváttá alakítás</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CollapsibleContent className="mt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Típus:</p>
                          <Badge 
                            variant={habit.habit_type === "bad_habit" ? "destructive" : "outline"}
                            className={`font-medium text-black ${habit.habit_type === "normal_habit" ? "border-green-700 text-gray-900 dark:text-white" : "text-white"}`}
                          >
                            {translateHabitType(habit.habit_type)}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Felhasználó:</p>
                          {habit.users && habit.users.length > 0 ? (
                            <div>
                              <p>
                                {habit.users.length > 1 ? 
                                  `${habit.users.length} felhasználó` : 
                                  habit.users[0].user_metadata?.name || "-"}
                              </p>
                              {habit.users.length === 1 && habit.users[0].email && (
                                <p className="text-xs text-muted-foreground">{habit.users[0].email}</p>
                              )}
                              {habit.users.length > 1 && (
                                <div className="mt-1">
                                  <details className="text-xs">
                                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">Felhasználók listája</summary>
                                    <ul className="mt-1 pl-2">
                                      {habit.users.map((user: {id: string, email: string, user_metadata?: {name?: string}}, idx: number) => (
                                        <li key={idx}>{user.user_metadata?.name || user.email || user.id}</li>
                                      ))}
                                    </ul>
                                  </details>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p>—</p>
                          )}
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
            <ClipboardX className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nincsenek szokások</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              {searchQuery || statusFilter !== "all"
                ? "Nincs találat a keresési feltételeknek megfelelően."
                : "Még nem hozott létre egyetlen szokást sem."}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link href="/habits/add">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Új szokás létrehozása
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
