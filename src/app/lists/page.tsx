"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash } from "lucide-react";

type ChecklistElement = {
    description: string;
    status: string;
};

type Checklist = {
    id: number;
    user_id?: number;
    name: string;
    // using record for simplicity
    elements?: Record<string, string>;
};

export default function ListsPage() {
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newListName, setNewListName] = useState("");
    const [selectedTab, setSelectedTab] = useState<string>("");
    const [editingListId, setEditingListId] = useState<number | null>(null);
    const [editingListName, setEditingListName] = useState("");

    // New state to handle adding items per checklist.
    // Key is checklist id, and value is the new item text
    const [newItemText, setNewItemText] = useState<Record<number, string>>({});

    // State for editing an individual item.
    // Contains the checklist id, the original description and the new description.
    const [editingItem, setEditingItem] = useState<{
        checklistId: number;
        oldDescription: string;
        newDescription: string;
    } | null>(null);

    useEffect(() => {
        async function fetchChecklists() {
            const res = await fetch("/api/checklists");
            if (res.ok) {
                const data = await res.json();
                setChecklists(data);
            } else {
                console.error("Error fetching checklists");
            }
            setIsLoading(false);
        }
        fetchChecklists();
    }, []);

    useEffect(() => {
        if (checklists.length > 0) {
            if (!checklists.some((cl) => cl.id.toString() === selectedTab)) {
                setSelectedTab(checklists[0].id.toString());
            }
        } else {
            setSelectedTab("");
        }
    }, [checklists, selectedTab]);

    const handleCheckboxChange = async (
        checklistId: number,
        description: string,
        checked: boolean
    ) => {
        const newStatus = checked ? "CHECKED" : "UNCHECKED";
        const updatedChecklists = checklists.map((cl) => {
            if (cl.id !== checklistId || !cl.elements) return cl;
            return {
                ...cl,
                elements: {
                    ...cl.elements,
                    [description]: newStatus,
                },
            };
        });
        setChecklists(updatedChecklists);
    };

    const handleAddList = () => {
        if (!newListName.trim()) return;
        const newId =
            checklists.length > 0
                ? Math.max(...checklists.map((cl) => cl.id)) + 1
                : 1;
        const newChecklist: Checklist = {
            id: newId,
            name: newListName,
            elements: {},
        };
        setChecklists([...checklists, newChecklist]);
        setNewListName("");
    };

    const handleDeleteList = (id: number) => {
        const index = checklists.findIndex((cl) => cl.id === id);
        const updatedChecklists = checklists.filter((cl) => cl.id !== id);
        setChecklists(updatedChecklists);
        if (selectedTab === id.toString()) {
            if (updatedChecklists.length > 0) {
                const newIndex =
                    index < updatedChecklists.length ? index : updatedChecklists.length - 1;
                setSelectedTab(updatedChecklists[newIndex].id.toString());
            } else {
                setSelectedTab("");
            }
        }
    };

    const handleStartEditing = (id: number, currentName: string) => {
        setEditingListId(id);
        setEditingListName(currentName);
    };

    const handleSaveEdit = (id: number) => {
        const updatedChecklists = checklists.map((cl) => {
            if (cl.id === id) {
                return { ...cl, name: editingListName };
            }
            return cl;
        });
        setChecklists(updatedChecklists);
        setEditingListId(null);
        setEditingListName("");
    };

    const handleCancelEdit = () => {
        setEditingListId(null);
        setEditingListName("");
    };

    // Add a new item to a checklist.
    const handleAddItem = (checklistId: number) => {
        const text = newItemText[checklistId];
        if (!text?.trim()) return;
        const updatedChecklists = checklists.map((cl) => {
            if (cl.id === checklistId) {
                const currentElements = cl.elements || {};
                return {
                    ...cl,
                    elements: {
                        ...currentElements,
                        [text]: "UNCHECKED",
                    },
                };
            }
            return cl;
        });
        setChecklists(updatedChecklists);
        setNewItemText({ ...newItemText, [checklistId]: "" });
    };

    // Start editing an existing item.
    const handleStartEditingItem = (checklistId: number, oldDescription: string) => {
        setEditingItem({ checklistId, oldDescription, newDescription: oldDescription });
    };

    // Save the edited item.
    const handleSaveEditingItem = () => {
        if (!editingItem) return;
        const { checklistId, oldDescription, newDescription } = editingItem;
        const updatedChecklists = checklists.map((cl) => {
            if (cl.id === checklistId && cl.elements) {
                const { [oldDescription]: _, ...rest } = cl.elements;
                return {
                    ...cl,
                    elements: {
                        ...rest,
                        [newDescription]: cl.elements[oldDescription], // keep the same status
                    },
                };
            }
            return cl;
        });
        setChecklists(updatedChecklists);
        setEditingItem(null);
    };

    const handleCancelEditingItem = () => {
        setEditingItem(null);
    };

    if (isLoading) {
        return (
            <div className="mx-14 py-10">
                <div className="flex items-end justify-between">
                    <Skeleton className="h-10 w-48" />
                </div>
                <div className="mt-8">
                    <div className="grid w-full grid-cols-3 gap-2 mb-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <Skeleton className="h-8 w-64" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableBody>
                                    {[1, 2, 3].map((item) => (
                                        <TableRow key={item}>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Skeleton className="h-4 w-4 rounded" />
                                                    <Skeleton className="h-6 w-48" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-14 py-10">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-bold pt-12">Listák</h1>
                </div>
                <div className="flex gap-2 items-center">
                    <Input
                        placeholder="Új lista neve"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                    />
                    <Button onClick={handleAddList}>Új lista hozzáadása</Button>
                </div>
            </div>
            {checklists.length > 0 ? (
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-auto mt-8">
                    <TabsList className="w-auto">
                        {checklists.map((checklist) => (
                            <TabsTrigger value={checklist.id.toString()} key={checklist.id}>
                                {checklist.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {checklists.map((checklist) => (
                        <TabsContent value={checklist.id.toString()} key={checklist.id}>
                            <Card>
                                <CardHeader className="flex flex-row items-center space-x-2">
                                    {editingListId === checklist.id ? (
                                        <>
                                            <Input
                                                value={editingListName}
                                                onChange={(e) => setEditingListName(e.target.value)}
                                                className="text-2xl pt-2"
                                            />
                                            <Button className="w-auto" onClick={() => handleSaveEdit(checklist.id)}>
                                                Mentés
                                            </Button>
                                            <Button
                                                className="w-auto"
                                                variant="ghost"
                                                onClick={handleCancelEdit}
                                            >
                                                Mégsem
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <CardTitle className="text-2xl pt-2">
                                                {checklist.name}
                                            </CardTitle>
                                            <Button
                                                className="w-auto"
                                                variant="ghost"
                                                onClick={() =>
                                                    handleStartEditing(checklist.id, checklist.name)
                                                }
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                className="w-auto"
                                                variant="ghost"
                                                onClick={() => handleDeleteList(checklist.id)}
                                            >
                                                <Trash />
                                            </Button>
                                        </>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableBody>
                                            {checklist.elements && Object.keys(checklist.elements).length > 0 ? (
                                                Object.entries(checklist.elements).map(([description, status]) => (
                                                    <TableRow key={description}>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={description}
                                                                    checked={status === "CHECKED"}
                                                                    onCheckedChange={(checked: boolean) =>
                                                                        handleCheckboxChange(
                                                                            checklist.id,
                                                                            description,
                                                                            checked
                                                                        )
                                                                    }
                                                                />
                                                                {editingItem &&
                                                                editingItem.checklistId === checklist.id &&
                                                                editingItem.oldDescription === description ? (
                                                                    <>
                                                                        <Input
                                                                            value={editingItem.newDescription}
                                                                            onChange={(e) =>
                                                                                setEditingItem({
                                                                                    ...editingItem,
                                                                                    newDescription: e.target.value,
                                                                                })
                                                                            }
                                                                            className="text-lg"
                                                                        />
                                                                        <Button
                                                                            className="w-auto"
                                                                            onClick={handleSaveEditingItem}
                                                                        >
                                                                            Mentés
                                                                        </Button>
                                                                        <Button
                                                                            className="w-auto"
                                                                            variant="ghost"
                                                                            onClick={handleCancelEditingItem}
                                                                        >
                                                                            Mégsem
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <label
                                                                            htmlFor={description}
                                                                            className={`text-lg transition-colors duration-500 ease-in-out ${
                                                                                status === "CHECKED"
                                                                                    ? "line-through text-gray-500"
                                                                                    : ""
                                                                            }`}
                                                                        >
                                                                            {description}
                                                                        </label>
                                                                        <Button
                                                                            className="w-auto"
                                                                            variant="ghost"
                                                                            onClick={() =>
                                                                                handleStartEditingItem(checklist.id, description)
                                                                            }
                                                                        >
                                                                            <Edit size={16} />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell>
                                                        Üres a lista.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {/* Row for adding a new item */}
                                            <TableRow>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Input
                                                            placeholder="Új elem..."
                                                            value={newItemText[checklist.id] || ""}
                                                            onChange={(e) =>
                                                                setNewItemText({
                                                                    ...newItemText,
                                                                    [checklist.id]: e.target.value,
                                                                })
                                                            }
                                                            className="text-lg"
                                                        />
                                                        <Button
                                                            className="w-auto"
                                                            onClick={() => handleAddItem(checklist.id)}
                                                        >
                                                            Hozzáadás
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>
            ) : (
                <div className="flex items-center justify-center h-96">
                    <p className="mt-8 text-center w-full text-gray-500 font-bold text-xl">
                        Nincs elérhető lista.
                    </p>
                </div>
            )}
        </div>
    );
}
