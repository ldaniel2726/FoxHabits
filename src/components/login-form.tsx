"use client";

import { useState } from "react";
import Link from "next/link";
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
import { login } from "@/app/login/actions";
import { Eye, EyeOff } from "lucide-react";
import { GoogleButton } from "@/components/auth/google-button";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    const response = await login(formData);

    if (response.error) {
      setError(response.error);
      toast.error(response.error);
    } else {
      toast.success("Sikeres bejelentkezés!");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Bejelentkezés</CardTitle>
        <CardDescription>Jelentkezz be egyszerűen az email címeddel</CardDescription>
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
                <Link 
                  href="/forgot-password" 
                  className="ml-auto inline-block text-sm underline"
                >
                  Elfelejtetted a jelszavad?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-2 top-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">
              Bejelentkezés
            </Button>
          </div>
        </form>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">vagy</span>
          </div>
        </div>
        <GoogleButton />
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
