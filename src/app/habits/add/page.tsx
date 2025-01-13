import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import HabitCreateFormComponent from "@/components/habit-create-form";

const formSchema = z.object({
  habit_name: z.string().min(1).max(255),
  habit_type: z.enum(["normal_habit", "bad_habit"]),
  interval: z.number().positive(),
  habit_interval_type: z.enum(["hours", "days", "weeks", "months", "years"]),
  start_date: z.string().datetime(),
  is_active: z.boolean(),
});

type FormSchema = z.infer<typeof formSchema>;

export default function HabitCreatePage() {
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Új szokás létrehozása</CardTitle>
          <CardDescription>Add meg az új szokásod részleteit alább.</CardDescription>
        </CardHeader>
        <CardContent>
          <HabitCreateFormComponent />
        </CardContent>
      </Card>
    </div>
  );
}
