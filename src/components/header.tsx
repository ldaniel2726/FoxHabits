"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LogoutButton from "@/components/logout-button";
import { User } from "@supabase/supabase-js";
import { Menu, X } from "lucide-react";

export default function Header({ data }: { data: { user: User | null } }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  let imgSrc = "";

  if (
    !data.user?.user_metadata.picture &&
    !data.user?.user_metadata.avatar_url
  ) {
    imgSrc = "";
  } else {
    imgSrc =
      data.user?.user_metadata.picture || data.user?.user_metadata.avatar_url;
  }

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="sticky top-0 z-50 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <header className="flex justify-between h-20 w-full shrink-0 items-center px-4 md:px-6">
          <Link href="/" className="mr-6 flex" prefetch={false}>
            <span className="sr-only">Fox Habits</span>
            <LogoIcon />
          </Link>
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden mr-4"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          <div className="ml-auto hidden lg:flex gap-2">
            {data.user ? (
              <>
                <Link
                  href="/"
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md p-4 text-base font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
                  prefetch={false}
                >
                  Kezdőlap
                </Link>
                <Link
                  href="/habits"
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md p-4 text-base font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
                  prefetch={false}
                >
                  Szokások
                </Link>
                <Link
                  href="/lists"
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md p-4 text-base font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
                  prefetch={false}
                >
                  Listák
                </Link>
                <Link
                  href="/habits/today"
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md p-4 text-base font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
                  prefetch={false}
                >
                  Napi nézet
                </Link>
                <Link
                  href="/statistics"
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md p-4 text-base font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
                  prefetch={false}
                >
                  Statisztika
                </Link>
                {data.user?.user_metadata.role === "admin" && (
                  <Link
                    href="/admin"
                    className="group inline-flex h-9 w-max items-center justify-center rounded-md p-4 text-base font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
                    prefetch={false}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md p-4 text-base font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
                  prefetch={false}
                >
                  <Button variant="ghost" className="justify-self-end hover:bg-transparent p-0">
                    {data.user?.user_metadata.name}
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={imgSrc} alt="Avatar" />
                      <AvatarFallback>{data.user?.user_metadata.name.charAt(0).toUpperCase() + data.user?.user_metadata.name.charAt(1).toUpperCase()}</AvatarFallback>
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
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen
            ? "max-h-[500px] opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-4"
        }`}
      >
        <nav className="top-20 left-0 right-0 p-4 shadow-md flex flex-col gap-4">
          {data.user ? (
            <>
              <Link
                href="/"
                className="mx-6"
                onClick={() => setIsMobileMenuOpen(false)}
                prefetch={false}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start text-base"
                >
                  Kezdőlap
                </Button>
              </Link>
              <Link
                href="/habits"
                className="mx-6"
                onClick={() => setIsMobileMenuOpen(false)}
                prefetch={false}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start text-base"
                >
                  Szokások
                </Button>
              </Link>
              <Link
                href="/lists"
                className="mx-6"
                onClick={() => setIsMobileMenuOpen(false)}
                prefetch={false}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start text-base"
                >
                  Listák
                </Button>
              </Link>
              <Link
                href="/habits/today"
                className="mx-6"
                onClick={() => setIsMobileMenuOpen(false)}
                prefetch={false}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start text-base"
                >
                  Napi nézet
                </Button>
              </Link>
              <Link
                href="/statistics"
                className="mx-6"
                onClick={() => setIsMobileMenuOpen(false)}
                prefetch={false}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start text-base"
                >
                  Statisztika
                </Button>
              </Link>
              {data.user?.user_metadata.role === "admin" && (
                <Link
                  href="/admin"
                  className="mx-6"
                  onClick={() => setIsMobileMenuOpen(false)}
                  prefetch={false}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-base"
                  >
                    Admin
                  </Button>
                </Link>
              )}
              <Link
                href="/profile"
                className="mx-6"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  className="w-full flex justify-between items-center text-base py-6 "
                >
                  {data.user?.user_metadata.name}
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={imgSrc} alt="Avatar" />
                    <AvatarFallback>{data.user?.user_metadata.name.charAt(0).toUpperCase() + data.user?.user_metadata.name.charAt(1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="mx-6"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button variant="outline" className="w-full">
                  Bejelentkezés
                </Button>
              </Link>
              <Link
                href="/signup"
                className="mx-6"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button className="w-full">Regisztráció</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}

function LogoIcon() {
  return (
    <svg
      className="mt-2"
      width="35"
      height="35"
      viewBox="0 0 213 222"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_5_2)">
        <line
          x1="46"
          y1="43"
          x2="169"
          y2="43"
          stroke="#ca3500"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M106.694 217C120.855 216.783 126.187 214.017 129.694 203"
          stroke="#ca3500"
          strokeWidth="12"
        />
        <path
          d="M107.694 217C93.5318 216.783 88.2006 214.017 84.6936 203"
          stroke="#ca3500"
          strokeWidth="12"
        />
        <line
          x1="170.957"
          y1="40.9412"
          x2="204.515"
          y2="7.04284"
          stroke="#ca3500"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M7 7L43 43"
          stroke="#ca3500"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <line x1="7" y1="7" x2="7" y2="127" stroke="#ca3500" strokeWidth="12" />
        <path
          d="M7.04716 125.646C7.04716 156 74.6936 174 84.8289 203.428"
          stroke="#ca3500"
          strokeWidth="12"
        />
        <path
          d="M129.741 205.829C129.741 175.475 197.387 157.475 207.523 128.047"
          stroke="#ca3500"
          strokeWidth="12"
        />
        <path
          d="M207 7V127"
          stroke="#ca3500"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <line
          x1="129.821"
          y1="201.455"
          x2="128.821"
          y2="205.455"
          stroke="#ca3500"
          strokeWidth="12"
        />
        <line
          x1="65.1962"
          y1="105.804"
          x2="76.4545"
          y2="112.304"
          stroke="#a25201"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <line
          x1="6"
          y1="-6"
          x2="19"
          y2="-6"
          transform="matrix(-0.866025 0.5 0.5 0.866025 151.589 108)"
          stroke="#a25201"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <line
          x1="107"
          y1="222"
          x2="107"
          y2="187"
          stroke="#ca3500"
          strokeWidth="8"
        />
        <path
          d="M97.5 189.5H117.5"
          stroke="#ca3500"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_5_2">
          <rect width="213" height="222" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
