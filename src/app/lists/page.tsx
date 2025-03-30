"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChecklistCard from "../../components/CheckListCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checklist } from "@/types/Checklist";

export default function ListsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newListName, setNewListName] = useState("");
  const [selectedTab, setSelectedTab] = useState<string>("");

  const updateChecklist = useCallback((updatedChecklist: Checklist) => {
    setChecklists((prev) => (prev.map((cl) => (cl.id === updatedChecklist.id ? updatedChecklist : cl))));
  }, []);

  const deleteChecklist = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/checklists/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setChecklists((prev) => prev.filter((cl) => cl.id !== id));
        if (selectedTab === id.toString()) {
          setSelectedTab((prev) => prev.length ? prev : "");
        }
      } else {
        console.error("Error deleting checklist", await res.text());
      }
    } catch (err) {
      console.error("API request error", err);
    }
  }, [selectedTab]);

  useEffect(() => {
    async function fetchChecklists() {
      try {
        const res = await fetch("/api/checklists");
        if (res.ok) {
          const data = await res.json();
          setChecklists(data);
        } else {
          console.error("Error fetching checklists", await res.text());
        }
      } catch (err) {
        console.error("Fetch error", err);
      }
      setIsLoading(false);
    }
    fetchChecklists();
  }, []);

  useEffect(() => {
    if (checklists.length > 0 && !checklists.some((cl) => cl.id.toString() === selectedTab)) {
      setSelectedTab(checklists[0].id.toString());
    }
    if (checklists.length === 0) {
      setSelectedTab("");
    }
  }, [checklists, selectedTab]);

  const handleAddList = async () => {
    if (!newListName.trim()) return;
    const payload = { name: newListName, elements: [] };
    try {
      const res = await fetch(`/api/checklists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const result = await res.json();
        const checklist = Array.isArray(result) ? result[0] : result;
        setChecklists([...checklists, checklist]);
        setNewListName("");
        setSelectedTab(checklist.id.toString());
      } else {
        console.error("Error adding checklist", await res.text());
      }
    } catch (err) {
      console.error("API request error", err);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-14 my-20 py-14 space-y-4">
        <Skeleton className="h-8 w-1/2"/>
        <Skeleton className="h-10 w-full"/>
        <Skeleton className="h-10 w-full"/>
        <Skeleton className="h-10 w-full"/>
      </div>
    );
  }

  return (
    <div className="mx-2 md:mx-14 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between">
        <h1 className="text-4xl font-bold pt-12">Listák</h1>
        <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0 md:items-center">
          <Input
            placeholder="Új lista neve"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddList()}
          />
          <Button onClick={handleAddList} variant="default">Új lista hozzáadása</Button>
        </div>
      </div>
      {checklists.length > 0 ? (
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-auto mt-8">
          <TabsList className="w-auto">
            {checklists.map((cl) => ( <TabsTrigger value={cl.id.toString()} key={cl.id}>{cl.name}</TabsTrigger> ))}
          </TabsList>
          {checklists.map((cl) => (
            <TabsContent value={cl.id.toString()} key={cl.id}>
              <ChecklistCard
                checklist={cl}
                selected={selectedTab === cl.id.toString()}
                onUpdate={updateChecklist}
                onDelete={deleteChecklist}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="flex items-center justify-center h-96">
          <p className="mt-8 text-center w-full text-gray-500 font-bold text-xl">Nincs elérhető lista.</p>
        </div>
      )}
    </div>
  );
}
