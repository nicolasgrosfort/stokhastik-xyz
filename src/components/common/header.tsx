"use client";

import { H2 } from "@/components/h2";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Header = () => {
  const pathname = usePathname();

  const activeClassName = "bg-foreground text-background";
  const inactiveClassName = "bg-background text-foreground";

  return (
    <header className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-px bg-foreground border-b border-px border-foreground">
      <Link
        href="/store"
        className={`hover:underline p-1 w-full text-xs h-full flex items-center justify-center ${pathname.startsWith("/store") ? activeClassName : inactiveClassName}`}
      >
        STORE
      </Link>
      <H2 className="bg-background col-span-2 sm:col-span-2 xl:col-span-6 order-first sm:order-0 p-2">
        <Link href="/">STOKHASTIK</Link>
      </H2>
      <Link
        href="/about"
        className={`hover:underline p-1 w-full text-xs h-full flex items-center justify-center ${pathname.startsWith("/about") ? activeClassName : inactiveClassName}`}
      >
        À PROPOS
      </Link>
    </header>
  );
};
