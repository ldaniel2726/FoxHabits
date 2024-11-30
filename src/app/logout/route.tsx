import { createClient } from '@/utils/supabase/server';
import { redirect } from "next/navigation";
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const supabase = createClient();

  await (await supabase).auth.signOut();

  const cookieStore = cookies();
  
  (await cookieStore).getAll().forEach(async (cookie) => {
    (await cookieStore).delete(cookie.name);
  });

  return redirect('/login');
}
