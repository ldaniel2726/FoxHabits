"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

import { toast } from 'sonner';
import { signup } from '@/app/signup/actions';
import { GoogleButton } from '@/components/auth/google-button';

export function SignUpForm() {

  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    const response = await signup(formData);
    if (response.error) {
      setError(response.error);
      toast.error(response.error);
    } else if (response.success) {
      toast.success('Sikeres regisztráció! Kérjük, ellenőrizd az email fiókodat a visszaigazoló linkért.');
      router.push('/login');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Regisztráció</CardTitle>
        <CardDescription>
          Regisztrálj egyszerűen a neveddel és email címeddel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Név</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="A Te neved"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="yourname@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Jelszó</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Jelszó megerősítése</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full">
                  Regisztráció
              </Button>
            </div>
            <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">vagy</span>
          </div>
        </div>
        <GoogleButton />
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
