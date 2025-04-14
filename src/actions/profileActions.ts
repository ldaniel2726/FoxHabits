"use server";

import { createClient } from '@/utils/supabase/server';

export const getUser = async () => {
  const supabase = await createClient();
  return await supabase.auth.getUser();
};

export const updateUser = async (name: string) => {
  const supabase = await createClient();

  if (name === '') {
    return;
  } else {
    if (name !== '') {
      return await supabase.auth.updateUser({
        data: { name: name }
      });
    }
  }
};
