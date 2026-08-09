"use client";

import { Badge } from "@/components/badge";
import { Scramble } from "@/components/common/scramble";
import { Separator } from "@/components/common/separator";
import { FormatedDate } from "@/components/formated-date";
import { H3 } from "@/components/h3";
import { Price } from "@/components/price";
import { useGetItems } from "@/hooks/useGetItems";
import { useGetTokens } from "@/hooks/useGetTokens";
import { GetStoreItem } from "@/libs/store-item";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { useState } from "react";

export const Details = ({ slug }: { slug: GetStoreItem["slug"] }) => {
  const { item, isPending } = useGetItems(slug);
  const { status: sessionStatus } = useSession();
  const { tokens } = useGetTokens();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  const buyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/store/items/${item?.id}/buy`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erreur inconnue");
      return data;
    },
    onMutate: () => setError(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-tokens"] });
      queryClient.invalidateQueries({ queryKey: ["store-items"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  if (!item) {
    if (isPending) return null;
    redirect("/store");
  }

  const insufficientTokens = tokens !== undefined && tokens < item.price;

  const handleBuyClick = () => {
    if (buyMutation.isPending) return;
    if (needsConfirm) {
      setNeedsConfirm(false);
      buyMutation.mutate();
      return;
    }
    setNeedsConfirm(true);
  };

  return (
    <>
      <H3 className="uppercase">{item.name}</H3>
      <div className="flex flex-col gap-2 w-full">
        <p className="font-mono text-sm">{item.description}</p>

        <div className="flex gap-4 w-full items-center justify-between text-xs">
          <span>
            Mise en ligne le <FormatedDate date={item.releaseDate} />
          </span>
          <Price price={item.price} highlighted />
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4 w-full items-center">
        {!item.buyerId ? (
          sessionStatus === "authenticated" ? (
            <motion.button
              onClick={handleBuyClick}
              disabled={buyMutation.isPending || insufficientTokens}
              // initial={needsConfirm ? { scale: 0.9 } : false}
              // animate={{ scale: 1 }}
              key={needsConfirm ? "needsConfirm" : "confirm"}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-foreground text-background border border-foreground font-mono text-xs uppercase p-1 block w-full cursor-pointer text-center hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-foreground disabled:hover:text-background disabled:hover:no-underline"
            >
              <Scramble
                key={
                  buyMutation.isPending
                    ? "pending"
                    : needsConfirm
                      ? "confirm"
                      : "default"
                }
                scrambleOnMount
              >
                {buyMutation.isPending
                  ? "Achat..."
                  : needsConfirm
                    ? "T'es sûr ?"
                    : `Acheter · ${item.price} STKH`}
              </Scramble>
            </motion.button>
          ) : (
            <Link
              href={`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`}
              className="bg-foreground text-background border border-foreground font-mono text-xs uppercase p-1 block w-full cursor-pointer text-center hover:underline"
            >
              Je le veux !
            </Link>
          )
        ) : (
          <Badge className="w-full bg-foreground text-background! opacity-70">
            Vendu !
          </Badge>
        )}
        {needsConfirm ? (
          <button
            onClick={() => setNeedsConfirm(false)}
            className="text-xs uppercase block w-full cursor-pointer text-center border border-foreground font-mono p-1 hover:underline"
          >
            Annuler
          </button>
        ) : (
          <Link
            href="/store"
            className="text-xs uppercase block w-full cursor-pointer text-center border border-foreground font-mono p-1 hover:underline"
          >
            Retour au shop
          </Link>
        )}
      </div>

      {!item.buyerId && insufficientTokens && (
        <p className="text-xs mt-1">
          Solde insuffisant pour cet achat.{" "}
          <Link
            href={`/auth/payment?callbackUrl=${encodeURIComponent(pathname)}`}
            className="underline"
          >
            Recharger mon compte
          </Link>
        </p>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {item.buyerId && item.purchasedAt && (
        <p className="text-xs mt-1">
          Acheté par {item.buyer?.firstName} le{" "}
          <FormatedDate date={item.purchasedAt} />
        </p>
      )}
    </>
  );
};
