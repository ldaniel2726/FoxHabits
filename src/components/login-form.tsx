"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { login } from '@/app/login/actions';

export function LoginForm() {

  
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    const response = await login(formData);

    if (response.error) {
      setError(response.error);
      toast.error(response.error);
    } else {
      toast.success('Sikeres bejelentkezés!');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Bejelentkezés</CardTitle>
        <CardDescription>
          Jelentkezz be egyszerűen az email címeddel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="yourname@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Jelszó</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  Elfelejtetted a jelszavad?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">
              Bejelentkezés
            </Button>
          </div>
        </form>
        <div className="mt-4 text-center text-sm">
          Nincs még fiókod?{" "}
          <Link href="/signup" className="underline">
            Regisztráció
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
