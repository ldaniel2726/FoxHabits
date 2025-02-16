"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

export default function ListsPage() {
  const [checklists, setChecklists] = useState<any[]>([]);

  useEffect(() => {
    async function fetchChecklists() {
      const res = await fetch("/api/checklists");
      if (res.ok) {
        const data = await res.json();
        setChecklists(data);
      } else {
        console.error("Error fetching checklists");
      }
    }
    fetchChecklists();
  }, []);

  const handleCheckboxChange = async (
    checklistId: number,
    description: string,
    checked: boolean
  ) => {
    const newStatus = checked ? "CHECKED" : "UNCHECKED";
    const checklist = checklists.find((cl) => cl.id === checklistId);
    if (!checklist) return;
  
    let elementsArray: { description: string; status: string }[];
    if (Array.isArray(checklist.elements)) {
      elementsArray = checklist.elements;
    } else if (typeof checklist.elements === "object" && checklist.elements !== null) {
      elementsArray = Object.entries(checklist.elements).map(([desc, st]) => ({
        description: desc,
        status: st as string,
      }));
    } else {
      elementsArray = [];
    }
  
    let found = false;
    const updatedElements = elementsArray.map((el) => {
      if (el.description === description) {
        found = true;
        return { ...el, status: newStatus };
      }
      return el;
    });
    if (!found) {
      updatedElements.push({ description, status: newStatus });
    }
  
    const payload = {
      id: checklist.id,
      user_id: checklist.user_id,
      name: checklist.name,
      elements: updatedElements,
    };
  
    try {
      const res = await fetch("/api/checklists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) {
        console.error("Error updating checklist element");
      } else {
        console.log(`Updated element "${description}" to ${newStatus} in checklist ${checklistId}`);
        setChecklists((prev) =>
          prev.map((cl) =>
            cl.id === checklistId ? { ...cl, elements: updatedElements } : cl
          )
        );
      }
    } catch (error) {
      console.error("Error during POST call", error);
    }
  };

  return (
    <div className="mx-14 py-10">
      <div className="flex items-end justify-between">
        <h1 className="text-4xl font-bold pt-12">Listák</h1>
      </div>
      {checklists.length > 0 ? (
        <Tabs defaultValue={checklists[0].id.toString()} className="mt-8">
          <TabsList className="grid w-full grid-cols-3 gap-2">
            {checklists.map((checklist) => (
              <TabsTrigger value={checklist.id.toString()} key={checklist.id}>
                {checklist.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {checklists.map((checklist) => (
            <TabsContent value={checklist.id.toString()} key={checklist.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{checklist.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableBody>
                      {checklist.elements ? (
                        Object.entries(checklist.elements).map(([description, status]) => (
                          <TableRow key={description}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={description}
                                  defaultChecked={status === "CHECKED"}
                                  onChange={(e) =>
                                    handleCheckboxChange(
                                      checklist.id,
                                      description,
                                      (e.target as HTMLInputElement).checked
                                    )
                                  }
                                />
                                <label htmlFor={description} className="text-lg">
                                  {description}
                                </label>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2}>Üres a lista.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <p className="mt-8">Listák betöltése...</p>
      )}
    </div>
  );
}
