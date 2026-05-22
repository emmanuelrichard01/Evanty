import Image from "next/image"
import Link from "next/link"

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200/60 bg-white/50 backdrop-blur-sm">
      <div className="wrapper flex flex-col items-center justify-between gap-5 py-6 text-center sm:flex-row sm:py-8">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/images/logo3.png"
            alt="Evanty logo"
            width={28}
            height={28}
            className="h-7 w-auto object-contain opacity-85 hover:opacity-100 transition-opacity"
          />
          <span className="font-bold text-base tracking-tight text-slate-800 font-sans">
            EVANTY
          </span>
        </Link>

        <p className="text-sm text-slate-500 font-normal">
          &copy; {currentYear} Evanty. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer