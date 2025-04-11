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

interface HabitsTableProps {
  habits: Habit[] | null;
}

export function HabitsTable({ habits }: HabitsTableProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Szokások kezelése</CardTitle>
          <Link href="/habits/add">
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Új szokás
            </Button>
          </Link>
        </div>
      </CardHeader>
      <div className="px-4 py-3 border-b">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Szokás keresése..."
              className="pl-8"
            />
          </div>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Státusz szerint" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Összes</SelectItem>
              <SelectItem value="active">Teljesítve</SelectItem>
              <SelectItem value="pending">Folyamatban</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <CardContent className="p-0">
        {habits?.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3">Név</TableHead>
                <TableHead className="px-4 py-3">Státusz</TableHead>
                <TableHead className="w-[100px] px-4 py-3">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {habits?.map((habit: Habit) => (
                <TableRow
                  key={habit.habit_id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium px-4 py-3">
                    {habit.habit_names?.habit_name || `ID: ${habit.habit_id}`}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={habit.is_active ? "success" : "secondary"}
                      className="font-medium"
                    >
                      {habit.is_active ? "Teljesítve" : "Folyamatban"}
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
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/habits/${habit.habit_id}/edit`}
                            className="flex items-center"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Szerkesztés</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive flex items-center cursor-pointer">
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Törlés</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardX className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nincsenek szokások</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              Még senki nem hozott létre egyetlen szokást sem.
            </p>
            <Link href="/habits/add">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Új szokás létrehozása
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
