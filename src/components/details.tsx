"use client";

import { Badge } from "@/components/badge";
import { FormatedDate } from "@/components/formated-date";
import { H3 } from "@/components/h3";
import { Item } from "@/components/item";
import { Price } from "@/components/price";
import { useGetItems } from "@/hooks/useGetItems";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { useState } from "react";

export const Details = ({ id }: { id: Item["id"] }) => {
  const { item } = useGetItems(id);
  const { status: sessionStatus } = useSession();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const buyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/store/items/${id}/buy`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erreur inconnue");
      return data;
    },
    onMutate: () => setError(null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["store-items"] }),
    onError: (err: Error) => setError(err.message),
  });

  if (!item) {
    redirect("/store");
  }

  return (
    <>
      <H3 className="uppercase">{item.name}</H3>
      <div className="flex flex-col gap-1 w-full sm:max-w-104">
        <p className="font-mono text-sm">{item.description}</p>

        <div className="flex gap-4 w-full items-center justify-between text-xs">
          <span>
            Mise en ligne le <FormatedDate date={new Date(item.date)} />
          </span>
          <Price price={item.price} />
        </div>
      </div>

      <hr className="border-0 border-t sm:max-w-104 w-full my-2" />

      <div className="flex gap-4 w-full items-center">
        {item.status === "available" ? (
          sessionStatus === "authenticated" ? (
            <button
              onClick={() => buyMutation.mutate()}
              disabled={buyMutation.isPending}
              className="bg-foreground text-background hover:bg-background hover:text-foreground border border-foreground font-mono text-xs uppercase p-1 block sm:w-50 w-full cursor-pointer text-center hover:underline"
            >
              {buyMutation.isPending
                ? "Achat..."
                : `Acheter · ${item.price} STKH`}
            </button>
          ) : (
            <Link
              href={`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`}
              className="bg-foreground text-background hover:bg-background hover:text-foreground border border-foreground font-mono text-xs uppercase p-1 block sm:w-50 w-full cursor-pointer text-center hover:underline"
            >
              Je le veux !
            </Link>
          )
        ) : (
          <Badge status={item.status} className="sm:w-50 w-full" />
        )}
        <Link
          href="/store"
          className="text-xs uppercase block sm:w-50 w-full cursor-pointer text-center border border-foreground font-mono p-1 hover:underline"
        >
          Retour
        </Link>
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {item.status === "sold" && (
        <p className="text-xs mt-1">
          Acheté par {item.buyBy} le <FormatedDate date={new Date(item.buyAt)} />
        </p>
      )}
    </>
  );
};
