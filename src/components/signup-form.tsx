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

import { toast } from 'sonner';
import { signup } from '@/app/signup/actions';

export function SignUpForm() {

  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    const response = await signup(formData);

    if (response.error) {
      setError(response.error);
      toast.error(response.error);
    } else {
      toast.success('Sikeres regisztráció! Bejelentkezéshez lépj tovább.');
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
