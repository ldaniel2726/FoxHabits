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

export function SignUpForm(){
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const router = useRouter();
  
    const handleSignup = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!name || !email || !password || !confirmPassword) {
        toast.error("Minden mezőt ki kell tölteni");
        return;
      }

      if (password !== confirmPassword) {
        toast.error("A jelszavak nem egyeznek");
        return;
      }

      if (password.length < 8) {
        toast.error("A jelszónak legalább 8 karakter hosszúnak kell lennie");
        return;
      }

      const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])/;
      if (!passwordRegex.test(password)) {
        toast.error("A jelszónak tartalmaznia kell számot és speciális karaktert");
        return;
      }
  
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
  
      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Ez az email cím már regisztrálva van");
          router.push('/login');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Sikeres regisztráció");
        router.push('/profile');
      }
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Regisztráció</CardTitle>
        <CardDescription>
          Regisztrálj egyszerűen a neveddel és email címeddel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup}>
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Név</Label>
                    <Input
                    id="name"
                    type="text"
                    placeholder="A Te neved"
                    onChange={(e) => setName(e.target.value)}
                    required
                    />
                </div>
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
                    <Label htmlFor="password">Jelszó</Label>
                    <Input
                    id="password"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Jelszó megerősítése</Label>
                    <Input
                    id="confirmPassword"
                    type="password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    />
                </div>
                <Button type="submit" className="w-full">
                    Regisztráció
                </Button>
                </div>
                </form>
                <div className="mt-4 text-center text-sm">
                Már van fiókod?{" "}
                <Link href="/login" className="underline">
                    Bejelentkezés
                </Link>
            </div>
      </CardContent>
    </Card>
  );
}