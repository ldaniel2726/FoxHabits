"use client";

import { SignUpForm } from '@/components/signup-form';
import { useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {

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

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <SignUpForm />
    </div>
  );
}
