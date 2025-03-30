"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import { Checklist } from "@/types/Checklist";

type ChecklistCardProps = {
  checklist: Checklist;
  selected: boolean;
  onUpdate: (updated: Checklist) => void;
  onDelete: (id: number) => void;
};

export default function ChecklistCard({ checklist, selected, onUpdate, onDelete }: ChecklistCardProps) {
  const [editingListName, setEditingListName] = useState("");
  const [editingItemKey, setEditingItemKey] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState("");
  const [newItemText, setNewItemText] = useState("");

  const updateChecklistElements = useCallback(
    (elements: Record<string, string>) => {
      const updatedChecklist = { ...checklist, elements, updated_at: new Date().toISOString() };
      onUpdate(updatedChecklist);
    }, [checklist, onUpdate]
  );

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    if (checklist.elements && checklist.elements[newItemText]) {
      toast.error("Az elem már szerepel a listán.");
      setNewItemText("");
      return;
    }
    const updatedElements = { ...(checklist.elements || {}), [newItemText]: "UNCHECKED" };
    updateChecklistElements(updatedElements);
    setNewItemText("");
  };

  const handleCheckboxChange = (description: string, checked: boolean) => {
    const status = checked ? "CHECKED" : "UNCHECKED";
    const updatedElements = { ...checklist.elements, [description]: status };
    updateChecklistElements(updatedElements);
  };

  const handleDeleteItem = (description: string) => {
    const updatedElements = { ...checklist.elements };
    delete updatedElements[description];
    updateChecklistElements(updatedElements);
  };

  const handleStartEditingList = () => {
    setEditingListName(checklist.name);
  };

  const handleSaveListEdit = () => {
    onUpdate({ ...checklist, name: editingListName });
    setEditingListName("");
  };

  const handleStartEditingItem = (key: string) => {
    setEditingItemKey(key);
    setEditingItemText(key);
  };

  const handleSaveItemEdit = () => {
    if (!editingItemKey || !editingItemText.trim()) return;
    const { [editingItemKey]: oldStatus, ...rest } = checklist.elements || {};
    const updatedElements = { ...rest, [editingItemText]: oldStatus };
    updateChecklistElements(updatedElements);
    setEditingItemKey(null);
    setEditingItemText("");
  };

  return (
    <Card className="border border-gray-300 shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out">
      <CardHeader className="flex flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
        {editingListName ? (
          <>
            <Input
              value={editingListName}
              onChange={(e) => setEditingListName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveListEdit()}
              className="text-2xl pt-2"
            />
            <Button onClick={handleSaveListEdit}>Mentés</Button>
            <Button variant="ghost" onClick={() => setEditingListName("")}>
              Mégsem
            </Button>
          </>
        ) : (
          <>
            <CardTitle className="text-2xl pt-2">{checklist.name}</CardTitle>
            <Button variant="ghost" onClick={handleStartEditingList}>
              <Edit size={16} />
            </Button>
            <Button variant="ghost" onClick={() => onDelete(checklist.id)}>
              <Trash size={16} />
            </Button>
          </>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableBody>
              {checklist.elements && Object.keys(checklist.elements).length > 0
                ? Object.entries(checklist.elements).map(([description, status]) => (
                    <TableRow key={description}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={description}
                            checked={status === "CHECKED"}
                            onCheckedChange={(checked: boolean) =>
                              handleCheckboxChange(description, checked)
                            }
                          />
                          {editingItemKey === description ? (
                            <>
                              <Input
                                value={editingItemText}
                                onChange={(e) => setEditingItemText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSaveItemEdit()}
                                className="text-lg"
                              />
                              <Button onClick={handleSaveItemEdit}>Mentés</Button>
                              <Button variant="ghost" onClick={() => setEditingItemKey(null)}>
                                Mégsem
                              </Button>
                            </>
                          ) : (
                            <>
                              <label
                                htmlFor={description}
                                className={`text-lg transition-colors duration-500 ease-in-out ${
                                  status === "CHECKED" ? "line-through text-gray-500" : ""
                                }`}
                              >
                                {description}
                              </label>
                              <Button
                                variant="ghost"
                                onClick={() => handleDeleteItem(description)}
                              >
                                <Trash size={16} />
                              </Button>
                              <Button variant="ghost" onClick={() => handleStartEditingItem(description)}>
                                <Edit size={16} />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                : (
                  <TableRow>
                    <TableCell>Üres a lista.</TableCell>
                  </TableRow>
                )
              }
              <TableRow>
                <TableCell>
                  <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 items-center space-x-2">
                    <Input
                      placeholder="Új elem..."
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                      className="text-lg"
                    />
                    <Button className="w-full md:w-auto" onClick={handleAddItem}>Hozzáadás</Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
