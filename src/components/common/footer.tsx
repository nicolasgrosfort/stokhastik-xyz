"use client";

import { useGetTokens } from "@/hooks/useGetTokens";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Footer = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { tokens } = useGetTokens();

  const activeClassName = "bg-foreground text-background";
  const inactiveClassName = "bg-background text-foreground";

  return (
    <footer className="sticky bottom-0 z-10 grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-px bg-foreground border-t border-px border-foreground">
      {session ? (
        <Link
          href="/auth/profile"
          className={`hover:underline p-1 w-full text-xs h-full flex items-center justify-center ${pathname.startsWith("/auth/profile") ? activeClassName : inactiveClassName}`}
        >
          {session.user?.name || "Profil"}
        </Link>
      ) : (
        <Link
          href="/auth/signin"
          className={`hover:underline p-1 w-full text-xs h-full flex items-center justify-center ${pathname.startsWith("/auth/signin") ? activeClassName : inactiveClassName}`}
        >
          CONNEXION
        </Link>
      )}
      <p className="bg-background col-span-2 font-mono text-xs text-center gap-2 py-2 h-full flex items-center justify-center sm:col-span-2 xl:col-span-6 order-last sm:order-0 p-2">
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

      {session ? (
        <Link
          href="/auth/payment"
          className={`uppercase hover:underline p-1 w-full text-xs h-full flex items-center justify-center ${pathname.startsWith("/auth/payment") ? activeClassName : inactiveClassName}`}
        >
          {tokens !== undefined
            ? `${tokens.toLocaleString("fr-CH")} STKH`
            : "..."}
        </Link>
      ) : (
        <Link
          href="/auth/signup"
          className={`uppercase hover:underline p-1 w-full text-xs h-full flex items-center justify-center ${pathname.startsWith("/auth/signup") ? activeClassName : inactiveClassName}`}
        >
          Créer un compte
        </Link>
      )}
    </footer>
  );
};
