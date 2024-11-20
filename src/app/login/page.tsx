"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.push('/profile');
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.push('/profile');
    }
  };

  return (
    <div className="flex flex-row w-full flex-1 flex-col justify-center gap-2 px-8 sm:max-w-md m-auto">
      <h1 className="text-2xl mb-4">Login</h1>
      <form onSubmit={handleLogin} className="flex w-full flex-1 flex-col justify-center gap-2 text-foreground animate-in">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded"
        />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">Login</button>
      </form>
    </div>
  );
}
