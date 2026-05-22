import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Image from "next/image"
import Link from "next/link"
import { Button } from "../ui/button"
import NavItems from "./NavItems"
import MobileNav from "./MobileNav"

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/75 backdrop-blur-lg transition-all duration-300 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)]">
      <div className="wrapper flex h-16 items-center justify-between py-0">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center rounded-xl bg-slate-50 p-1 border border-slate-200/40 shadow-sm group-hover:border-slate-300 transition-all duration-300">
            <Image
              src="/assets/images/logo3.png" 
              width={28} 
              height={28}
              alt="Evanty logo"
              className="h-7 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent font-sans">
              EVANTY
            </span>
            <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-100/80 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-600 uppercase tracking-wider">
              Beta
            </span>
          </div>
        </Link>

        <SignedIn>
          <nav className="md:flex hidden items-center justify-center">
            <NavItems />
          </nav>
        </SignedIn>

        <div className="flex items-center justify-end gap-4">
          <SignedIn>
            <nav className="md:hidden">
              <MobileNav />
            </nav>
            <div className="border border-slate-200/60 rounded-full p-0.5 bg-slate-50 shadow-sm hover:border-slate-300 transition-all duration-200">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
          <SignedOut>
            <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-9 px-4 text-sm font-medium transition-all shadow-sm hover:shadow-indigo-600/10 hover:shadow active:scale-[0.98]">
              <Link href="/sign-in">
                Login
              </Link>
            </Button>
          </SignedOut>
        </div>
      </div>
    </header>
  )
}

export default Header