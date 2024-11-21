"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        router.push('/login');
      } else {
        setEmail(data.user?.email || '');
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/login');
    } else {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div>
      <div>Email: {email}</div>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
}