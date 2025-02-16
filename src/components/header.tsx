"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/server"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LogoutButton from '@/components/logout-button';
import { User } from '@supabase/supabase-js';

export default function Header({ data }: { data: { user: User | null } }) {

  let imgSrc = ""

  if (!(data.user?.user_metadata.picture) && !(data.user?.user_metadata.avatar_url)) {
    imgSrc = "https://github.com/shadcn.png"
  } else {
    imgSrc = data.user?.user_metadata.picture || data.user?.user_metadata.avatar_url
  }

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8">
      <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6">
        <Link href="/" className="mr-6 hidden lg:flex" prefetch={false}>
          <span className="sr-only">Fox Habits</span>
          <LogoIcon />
        </Link>
        <div className="ml-auto flex gap-2">
          <Link
            href="/"
            className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
            prefetch={false}
          >
            Kezdőlap
          </Link>
          <Link
            href="/habits"
            className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
            prefetch={false}
          >
            Szokások
          </Link>
          <Link
            href="/lists"
            className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
            prefetch={false}
          >
            Listák
          </Link>
          <Link
            href="/habits/today"
            className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
            prefetch={false}
          >
            Napi nézet
          </Link>
          <Link
            href="/profile"
            className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
            prefetch={false}
          >
            Fiók
          </Link>
            {data.user ? (
                <>
                    <Link href="/profile">
                        <Button variant="ghost" className="justify-self-end">
                            {data.user?.user_metadata.name}
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={imgSrc} alt="Avatar" />
                              <AvatarFallback>LD</AvatarFallback>
                            </Avatar>
                        </Button>
                    </Link>
                    <LogoutButton />
                </>
                ) : (
                <>
                    <Link href="/login">
                        <Button variant="outline" className="justify-self-end">
                            Bejelentkezés
                        </Button>
                    </Link>
                    <Link href="/signup">
                        <Button className="justify-self-end">Regisztráció</Button>
                    </Link>
                </>
            )}
        </div>
      </header>
    </div>
  )
}

function LogoIcon() {
    return (
        <svg className="mt-2" width="35" height="35" viewBox="0 0 213 222" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_5_2)">
            <line x1="46" y1="43" x2="169" y2="43" stroke="#130C0C" strokeWidth="12" strokeLinecap="round"/>
            <path d="M106.694 217C120.855 216.783 126.187 214.017 129.694 203" stroke="#130C0C" strokeWidth="12"/>
            <path d="M107.694 217C93.5318 216.783 88.2006 214.017 84.6936 203" stroke="#130C0C" strokeWidth="12"/>
            <line x1="170.957" y1="40.9412" x2="204.515" y2="7.04284" stroke="#130C0C" strokeWidth="12" strokeLinecap="round"/>
            <path d="M7 7L43 43" stroke="#130C0C" strokeWidth="12" strokeLinecap="round"/>
            <line x1="7" y1="7" x2="7" y2="127" stroke="#130C0C" strokeWidth="12"/>
            <path d="M7.04716 125.646C7.04716 156 74.6936 174 84.8289 203.428" stroke="#130C0C" strokeWidth="12"/>
            <path d="M129.741 205.829C129.741 175.475 197.387 157.475 207.523 128.047" stroke="#130C0C" strokeWidth="12"/>
            <path d="M207 7V127" stroke="#130C0C" strokeWidth="12" strokeLinecap="round"/>
            <line x1="129.821" y1="201.455" x2="128.821" y2="205.455" stroke="#130C0C" strokeWidth="12"/>
            <line x1="65.1962" y1="105.804" x2="76.4545" y2="112.304" stroke="#252525" strokeWidth="12" strokeLinecap="round"/>
            <line x1="6" y1="-6" x2="19" y2="-6" transform="matrix(-0.866025 0.5 0.5 0.866025 151.589 108)" stroke="#252525" strokeWidth="12" strokeLinecap="round"/>
            <line x1="107" y1="222" x2="107" y2="187" stroke="#130C0C" strokeWidth="8"/>
            <path d="M97.5 189.5H117.5" stroke="#130C0C" strokeWidth="8" strokeLinecap="round"/>
            </g>
            <defs>
            <clipPath id="clip0_5_2">
            <rect width="213" height="222" fill="white"/>
            </clipPath>
            </defs>
        </svg>
    )
}
