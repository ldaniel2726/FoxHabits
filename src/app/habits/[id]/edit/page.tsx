"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { HabitData } from "@/types/HabitData";

export default function EditHabitPage() {
  const router = useRouter();
  const params = useParams();
  const habitId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [habitData, setHabitData] = useState<HabitData | null>(null);
  
  const [habitName, setHabitName] = useState("");
  const [habitType, setHabitType] = useState<"normal_habit" | "bad_habit">("normal_habit");
  const [interval, setInterval] = useState(1);
  const [intervalType, setIntervalType] = useState("days");
  const [isActive, setIsActive] = useState(true);
  
  useEffect(() => {
    async function fetchHabitData() {
      try {
        const response = await fetch(`/api/habits/${habitId}`);
        
        if (!response.ok) {
          throw new Error("Nem sikerült betölteni a szokás adatait");
        }
        
        const result = await response.json();
        
        if (!result.data) {
          throw new Error("Nem található a szokás");
        }
        
        setHabitData(result.data);
        setHabitName(result.data.habit_names.habit_name);
        setHabitType(result.data.habit_type);
        setInterval(result.data.interval);
        setIntervalType(result.data.habit_interval_type);
        setIsActive(result.data.is_active);
      } catch (error) {
        console.error("Error fetching habit data:", error);
        toast.error("Hiba történt a szokás adatainak betöltésekor");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchHabitData();
  }, [habitId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      
      const updateData = {
        habit_name: habitName,
        habit_type: habitType,
        interval: Number(interval),
        habit_interval_type: intervalType,
        is_active: isActive
      };
      
      const response = await fetch(`/api/habits/${habitId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Hiba történt a szokás módosításakor");
      }
      
      toast.success("Szokás sikeresen módosítva");
      router.push(`/habits/${habitId}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating habit:", error);
      toast.error(error instanceof Error ? error.message : "Hiba történt a szokás módosításakor");
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Szokás szerkesztése</CardTitle>
            <CardDescription>Betöltés...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  if (!habitData) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Hiba</CardTitle>
            <CardDescription>A szokás nem található</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/habits")}>Vissza a szokásokhoz</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Szokás szerkesztése</CardTitle>
          <CardDescription>Módosítsd a szokás adatait</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="habit-name">Szokás neve</Label>
              <Input
                id="habit-name"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="habit-type">Szokás típusa</Label>
              <Select
                value={habitType}
                onValueChange={(value) => setHabitType(value as "normal_habit" | "bad_habit")}
              >
                <SelectTrigger id="habit-type">
                  <SelectValue placeholder="Válassz típust" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal_habit">Normál szokás</SelectItem>
                  <SelectItem value="bad_habit">Káros szokás</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {habitType === "normal_habit" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interval">Gyakoriság</Label>
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    value={interval}
                    onChange={(e) => setInterval(parseInt(e.target.value))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interval-type">Időegység</Label>
                  <Select
                    value={intervalType}
                    onValueChange={setIntervalType}
                  >
                    <SelectTrigger id="interval-type">
                      <SelectValue placeholder="Válassz időegységet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Óra</SelectItem>
                      <SelectItem value="days">Nap</SelectItem>
                      <SelectItem value="weeks">Hét</SelectItem>
                      <SelectItem value="months">Hónap</SelectItem>
                      <SelectItem value="years">Év</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="is-active">Aktív</Label>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/habits/${habitId}`)}
            >
              Mégsem
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Mentés..." : "Mentés"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
