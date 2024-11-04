"use client";

import { Button } from "../ui/button";
import { MoonIcon } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between justify-items-center">
        <Link href="/" className="flex items-center space-x-2 ml-6">
          <MoonIcon className="h-7 w-7" />
          <span className="hidden font-bold sm:inline-block">Highlight C3</span>
        </Link>
        <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <ul className="flex items-center justify-center space-x-2">
            <li>
              <Button variant="ghost" asChild>
                <Link href="/">Home</Link>
              </Button>
            </li>
            <li>
              <Button variant="ghost" asChild>
                <Link href="/about">About</Link>
              </Button>
            </li>
            <li>
              <Button variant="ghost" asChild>
                <Link href="/live">Live</Link>
              </Button>
            </li>
          </ul>
        </nav>
        <div className="w-[100px]">
          {/* Placeholder to balance the layout */}
        </div>
      </div>
    </header>
  );
}
