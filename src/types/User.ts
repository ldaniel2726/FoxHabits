export type User = {
  created_at: string;
  user_metadata: {
    name?: string;
    email?: string;
    full_name?: string;
  };
  email?: string;
  id: string;
}
