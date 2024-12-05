"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
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
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("A jelszavak nem egyeznek");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error("Hiba történt a jelszó módosítása során");
    } else {
      toast.success("Jelszó sikeresen módosítva!");
      router.push("/login");
    }

    setIsLoading(false);
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Új jelszó megadása</CardTitle>
          <CardDescription>Add meg az új jelszavad</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Új jelszó</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Új jelszó megerősítése</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Mentés..." : "Jelszó módosítása"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 