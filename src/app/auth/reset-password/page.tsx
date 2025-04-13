"use client";

import { useState, useEffect } from "react";
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
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    // Check for the token in the URL
    const token = searchParams.get('token_hash');
    const type = searchParams.get('type');
    
    if (type !== 'email' || !token) {
      toast.error("Érvénytelen vagy lejárt jelszó-visszaállító link");
      router.push('/login');
    }
  }, [searchParams, router]);

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

    if (password.length < 8 || !/[0-9]/.test(password) || !/[!@#$%^&*(),.?":{}|<>_-]/.test(password)) {
      toast.error("A jelszónak legalább 8 karakter hosszúnak kell lennie, és tartalmaznia kell legalább egy számot és egy speciális karaktert.");
      setIsLoading(false);
      return;
    }

    try {
      // Get the token from the URL
      const token = searchParams.get('token_hash');
      
      // Update the user's password using the token
      const { error } = await supabase.auth.updateUser({ 
        password: password,
      }, {
        // Pass the token to authenticate the password reset
        emailRedirectTo: window.location.origin
      });

      if (error) {
        console.error("Password reset error:", error);
        toast.error("Hiba történt a jelszó módosítása során: " + error.message);
      } else {
        toast.success("Jelszó sikeresen módosítva!");
        router.push("/login");
      }
    } catch (error) {
      console.error("Unexpected error during password reset:", error);
      toast.error("Váratlan hiba történt a jelszó módosítása során");
    } finally {
      setIsLoading(false);
    }
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