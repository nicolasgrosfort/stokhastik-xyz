"use client";

import { PaymentStatusMessage } from "@/components/common/payment-status-message";
import { Scramble } from "@/components/common/scramble";
import { useGetTokens } from "@/hooks/useGetTokens";
import { formatSwissNumber } from "@/libs/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

export const Footer = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { tokens } = useGetTokens();

  const activeClassName = "bg-foreground text-background";
  const inactiveClassName = "bg-background text-foreground";

  const creditClassName =
    "bg-background col-span-2 font-mono text-xs text-center gap-2 py-2 h-full flex items-center justify-center sm:col-span-2 xl:col-span-6 order-last sm:order-0 p-2";

  const credit = (
    <>
      <Scramble>Fait avec ❤️ par </Scramble>
      <Link
        href="https://www.tekh.studio"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        <Scramble>tèkh studio</Scramble>
      </Link>
    </>
  );

  return (
    <footer className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-px bg-foreground border-t border-px border-foreground">
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
      <Suspense fallback={<p className={creditClassName}>{credit}</p>}>
        <PaymentStatusMessage className={creditClassName} fallback={credit} />
      </Suspense>

      {session ? (
        <Link
          href="/auth/payment"
          className={`uppercase hover:underline p-1 w-full text-xs h-full flex items-center justify-center ${pathname.startsWith("/auth/payment") ? activeClassName : inactiveClassName}`}
        >
          <Scramble key={tokens ?? "pending"}>
            {tokens !== undefined ? `${formatSwissNumber(tokens)} STKH` : "..."}
          </Scramble>
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
