export type Checklist = {
    id: number;
    user_id?: string;
    name: string;
    elements?: Record<string, string>;
};
