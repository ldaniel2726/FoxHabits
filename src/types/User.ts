export type User = {
  created_at: string;
  user_metadata: {
    name?: string;
    email?: string;
  };
  email?: string;
  id: string;
}
