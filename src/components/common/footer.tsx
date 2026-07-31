"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const Footer = () => {
  const pathname = usePathname();

  const activeClassName = "bg-foreground text-background";
  const inactiveClassName = "bg-background text-foreground";

  return (
    <footer className="sticky bottom-0 z-10 grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-px bg-foreground border-t border-px border-foreground">
      <Link
        href="/garden"
        className={`uppercase hover:underline p-1 w-full text-xs h-full flex items-center justify-center ${pathname.startsWith("/garden") ? activeClassName : inactiveClassName}`}
      >
        Garden
      </Link>
      <p className="bg-background col-span-2 font-mono text-xs text-center gap-2 py-2 h-full flex items-center justify-center">
        Fait avec ❤️ par{" "}
        <Link
          href="https://www.tekh.studio"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          tèkh studio
        </Link>
      </p>
      <Link
        href="/shrine"
        className={`uppercase hover:underline p-1 w-full text-xs h-full flex items-center justify-center ${pathname.startsWith("/shrine") ? activeClassName : inactiveClassName}`}
      >
        Shrine
      </Link>
    </footer>
  );
};
