"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { resetPassword } from "@/app/login/actions";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const response = await resetPassword(formData);

    setIsLoading(false);

    if (response.error) {
      setError(response.error);
      toast.error(response.error);
    } else {
      toast.success("Jelszó visszaállítási link elküldve az email címére!");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Elfelejtett jelszó</CardTitle>
        <CardDescription>
          Add meg az email címed és küldünk egy jelszó visszaállítási linket
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
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Küldés..." : "Visszaállítási link küldése"}
            </Button>
            <div className="text-center text-sm">
              <Link href="/login" className="text-muted-foreground hover:underline">
                Vissza a bejelentkezéshez
              </Link>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 