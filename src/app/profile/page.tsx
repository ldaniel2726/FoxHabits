"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/navigation';

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

  return (
    <div>Email: {email}</div>
  );
}
