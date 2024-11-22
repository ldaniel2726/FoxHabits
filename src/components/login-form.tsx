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

import { useState, useEffect } from 'react';
import { supabase } from '@/app/supabaseClient';
import { useRouter } from 'next/navigation';
import { toast } from "sonner"

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      toast.error("Helytelen email vagy jelszó");
    } else {
      toast.success("Sikeres bejelentkezés");
      router.push('/profile');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(e);
  };

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
                type="email"
                placeholder="yourname@example.com"
                onChange={(e) => setEmail(e.target.value)}
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
              <Input id="password" type="password" required onChange={(e) => setPassword(e.target.value)} />
            </div>
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
