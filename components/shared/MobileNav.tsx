import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import Image from "next/image"
import { Separator } from "../ui/separator"
import NavItems from "./NavItems"

const MobileNav = () => {
  return (
    <nav className="md:hidden flex items-center">
      <Sheet>
        <SheetTrigger className="align-middle p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <Image 
            src="/assets/icons/menu.svg"
            alt="menu"
            width={22}
            height={22}
            className="cursor-pointer text-slate-700"
          />
        </SheetTrigger>
        <SheetContent className="flex flex-col gap-6 bg-white md:hidden border-l border-slate-100 p-6 pt-10">
          <div className="flex items-center gap-2">
            <Image 
              src="/assets/images/logo3.png"
              alt="logo"
              width={30}
              height={30}
              className="object-contain"
            />
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent">
              EVANTY
            </span>
          </div>
          <Separator className="bg-slate-100 my-1" />
          <NavItems />
        </SheetContent>
      </Sheet>
    </nav>
  )
}

export default MobileNav