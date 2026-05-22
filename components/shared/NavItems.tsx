'use client';

import { headerLinks } from '@/constants'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const NavItems = () => {
  const pathname = usePathname();

  return (
    <ul className="flex w-full flex-col items-stretch gap-1.5 md:flex-row md:items-center md:gap-1 bg-slate-100/50 md:p-1 border border-slate-200/40 rounded-2xl md:rounded-full">
      {headerLinks.map((link) => {
        const isActive = pathname === link.route;

        return (
          <li key={link.route} className="relative flex-1 md:flex-none">
            <Link 
              href={link.route}
              className={`text-sm font-medium transition-all duration-200 py-1.5 px-4 rounded-xl md:rounded-full block text-center ${
                isActive 
                  ? 'text-slate-900 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-200/40 font-semibold' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/40 md:hover:bg-transparent md:hover:text-slate-800'
              }`}
            >
              {link.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default NavItems