"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="bg-foreground text-background hover:bg-background hover:text-foreground border border-foreground font-mono text-xs uppercase p-1 block w-full cursor-pointer text-center hover:underline"
    >
      Déconnexion
    </button>
  );
}
