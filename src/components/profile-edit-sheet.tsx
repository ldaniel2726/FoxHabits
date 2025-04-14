"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserRoundPen } from "lucide-react";
import { updateUser } from '@/actions/profileActions';
import { UserData } from "@/types/UserData";

export default function ProfileEditSheet({ userData }: { userData: UserData }) {
  const handleUpdateUser = async () => {
    const name = document.getElementById('name') as HTMLInputElement;

    await updateUser(name.value);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="hover:text-orange-700 hover:border-orange-700 hover:border hover:shadow-xl p-2">
          <UserRoundPen />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Profil szerkesztése</SheetTitle>
          <SheetDescription>
            Végezze el a profilján a módosításokat itt. Kattintson a mentésre, ha kész.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Név
            </Label>
            <Input id="name" placeholder={userData.user?.user_metadata.name} className="col-span-3" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button onClick={handleUpdateUser} type="submit">Mentés</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
