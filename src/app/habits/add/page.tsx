import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import HabitCreateFormComponent from "@/components/habit-create-form";

export default function HabitCreatePage() {
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Új szokás létrehozása</CardTitle>
          <CardDescription>
            Add meg az új szokásod részleteit alább.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HabitCreateFormComponent />
        </CardContent>
      </Card>
    </div>
  );
}
