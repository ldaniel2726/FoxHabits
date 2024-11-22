import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { UserRoundPen } from "lucide-react"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

export function ProfileEditSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <UserRoundPen />
        </Button>
        {/*<TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">
                <UserRoundPen />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-base">Profil szerkesztése</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>*/}
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
            <Input onChange={() => {console.log()}} id="name" value="L. Dani" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input onChange={() => {console.log()}} id="email" value="lenart.daniel.peter@gmail.com" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bio" className="text-right">
              Bio
            </Label>
            <Textarea onChange={() => {console.log()}} id="bio" value="Szoftverfejlesztő vagyok, aki szereti a kihívásokat és a problémamegoldást. A szabadidőmben szívesen sportolok, olvasok és tanulok. A kedvenc programozási nyelvem a JavaScript, de a Python és a C# is közel áll a szívemhez." className="col-span-3"/>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Mentés</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
