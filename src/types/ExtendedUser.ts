import { User } from "@supabase/supabase-js";

export interface ExtendedUser extends User {
  banned_until?: string | null;
}
