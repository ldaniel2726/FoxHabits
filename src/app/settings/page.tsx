"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { updateSettings, exportData, getSettings } from './actions'
import { Skeleton } from "@/components/ui/skeleton"
import { Settings } from "@/types/Settings"

export default function SettingsPage() {
  const [isPending, setIsPending] = useState(false)

  const [settings, setSettings] = useState<Settings | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchSettings = async () => {
      const result = await getSettings()
      if (result.success) {
        setSettings(result.data?.[0])
      } else {
        toast.error(result.message)
      }
    }

    fetchSettings()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsPending(true)
    const formData = new FormData(event.currentTarget)
    const result = await updateSettings(formData)
    setIsPending(false)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error("Valami hiba történt. Ellenőrizd az internet kapcsolatodat.")
    }
  }

  const handleExportData = async () => {
    toast.message("Adatok exportálása folyamatban...");
    window.location.href = "/api/export";
  }
  
  
  if (!settings) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Beállítások</h1>
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
          </CardContent>
        </Card>
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <CardFooter className="flex justify-end">
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Beállítások</h1>
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Általános beállítások</CardTitle>
            <CardDescription>Személyre szabhatod a szokáskövető alkalmazást</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="theme">Téma</Label>
              <Select name="theme" defaultValue={settings.dark_mode || "system"}>
                <SelectTrigger>
                  <SelectValue placeholder="Válassz egy témát" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Világos</SelectItem>
                  <SelectItem value="dark">Sötét</SelectItem>
                  <SelectItem value="system">Rendszer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Értesítési beállítások</CardTitle>
            <CardDescription>Beállíthatod, hogyan szeretnéd megkapni az értesítéseket</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">Email értesítések</Label>
              <Switch name="emailNotifications" id="emailNotifications" defaultChecked={settings.email_notifications} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Adatkezelés</CardTitle>
            <CardDescription>Kezelheted a fiókod adatait</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button type="button" variant="outline" onClick={handleExportData}>
              Adatok exportálása
            </Button>
          </CardContent>
        </Card>

        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Mentés..." : "Beállítások mentése"}
          </Button>
        </CardFooter>
      </form>
    </div>
  )
}
