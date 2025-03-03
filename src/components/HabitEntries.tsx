"use client";

import { useState } from "react";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { Check, X, SkipForward, Forward } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteEntryButton } from "@/components/DeleteEntryButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Entry {
  entry_id: number;
  time_of_entry: string;
  entry_type: "done" | "skipped";
  datetime: string;
}

interface HabitEntriesProps {
  habitId: number;
  entries: Entry[];
}

export function HabitEntries({ habitId, entries: initialEntries }: HabitEntriesProps) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);

  const handleEntryDeleted = (deletedEntryId: number) => {
    setEntries(entries.filter(entry => entry.entry_id !== deletedEntryId));
  };

  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
  );

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Napló</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedEntries.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Nincsenek naplózások ehhez a szokáshoz</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dátum</TableHead>
                <TableHead>Óra, perc</TableHead>
                <TableHead>Állapot</TableHead>
                <TableHead className="w-[80px]">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEntries.map((entry) => {
                const entryDate = new Date(entry.datetime);
                return (
                  <TableRow key={entry.entry_id}>
                    <TableCell>
                      {format(entryDate, "yyyy. MMMM d.", { locale: hu })}
                    </TableCell>
                    <TableCell>
                      {format(entryDate, "HH:mm")}
                    </TableCell>
                    <TableCell>
                      {entry.entry_type === "done" ? (
                        <div className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          <span>Elvégezve</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Forward className="h-5 w-5 text-blue-500 mr-2" />
                          <span>Kihagyva</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <DeleteEntryButton 
                        entryId={entry.entry_id} 
                        onDelete={() => handleEntryDeleted(entry.entry_id)} 
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
} 