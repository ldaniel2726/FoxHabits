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
    console.log('RESET PASSWORD PAGE LOADED');
    console.log('Search params:', Object.fromEntries(searchParams.entries()));
    
    const token = searchParams.get('token_hash');
    const type = searchParams.get('type');
    
    console.log('Token hash:', token);
    console.log('Type:', type);
    
    if (type !== 'email' || !token) {
      console.error('Invalid reset parameters:', { type, token });
      toast.error("Érvénytelen vagy lejárt jelszó-visszaállító link");
      router.push('/login');
    } else {
      console.log('Valid reset parameters detected');
    }
  }, [searchParams, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    console.log('PASSWORD RESET FORM SUBMITTED');
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    
    console.log('Password validation starting');
    console.log('Password length:', password.length);
    console.log('Has number:', /[0-9]/.test(password));
    console.log('Has special char:', /[!@#$%^&*(),.?":{}|<>_-]/.test(password));
    console.log('Passwords match:', password === confirmPassword);

    if (password !== confirmPassword) {
      console.error('Password mismatch');
      toast.error("A jelszavak nem egyeznek");
      setIsLoading(false);
      return;
    }

    if (password.length < 8 || !/[0-9]/.test(password) || !/[!@#$%^&*(),.?":{}|<>_-]/.test(password)) {
      console.error('Password does not meet requirements');
      toast.error("A jelszónak legalább 8 karakter hosszúnak kell lennie, és tartalmaznia kell legalább egy számot és egy speciális karaktert.");
      setIsLoading(false);
      return;
    }

    try {
      const token = searchParams.get('token_hash');
      console.log('Attempting password update with token:', token);
      
      console.log('Supabase client initialized:', !!supabase);
      console.log('Calling supabase.auth.updateUser with password and redirect');
      
      const updateResult = await supabase.auth.updateUser({ 
        password: password,
      }, {
        emailRedirectTo: window.location.origin
      });
      
      console.log('Update user response received:', updateResult);
      console.log('Update user data:', updateResult.data);
      console.log('Update user error:', updateResult.error);

      if (updateResult.error) {
        console.error("Password reset error:", updateResult.error);
        console.error("Error code:", updateResult.error.code);
        console.error("Error message:", updateResult.error.message);
        console.error("Full error object:", JSON.stringify(updateResult.error));
        toast.error("Hiba történt a jelszó módosítása során: " + updateResult.error.message);
      } else {
        console.log('Password update successful');
        toast.success("Jelszó sikeresen módosítva!");
        router.push("/login");
      }
    } catch (error) {
      console.error("Unexpected error during password reset:", error);
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      } else {
        console.error("Non-Error object thrown:", error);
      }
      toast.error("Váratlan hiba történt a jelszó módosítása során");
    } finally {
      console.log('Password reset attempt completed');
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