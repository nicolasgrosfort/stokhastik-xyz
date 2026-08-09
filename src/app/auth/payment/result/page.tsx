"use client";

import { Separator } from "@/components/common/separator";
import { H3 } from "@/components/h3";
import { Model } from "@/components/model";
import { loadStripe } from "@stripe/stripe-js";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY est manquante.");
}

const stripePromise = loadStripe(publishableKey);

type PaymentState =
  | "loading"
  | "succeeded"
  | "processing"
  | "failed"
  | "unknown";

function PaymentResult() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [state, setState] = useState<PaymentState>("loading");

  const clientSecret = searchParams.get("payment_intent_client_secret");
  const callbackUrlParam = searchParams.get("callbackUrl");
  const callbackUrl =
    callbackUrlParam &&
    callbackUrlParam.startsWith("/") &&
    !callbackUrlParam.startsWith("//")
      ? callbackUrlParam
      : null;

  useEffect(() => {
    async function retrievePayment() {
      if (!clientSecret) {
        setState("unknown");
        return;
      }

      const stripe = await stripePromise;

      if (!stripe) {
        setState("failed");
        return;
      }

      const { paymentIntent, error } =
        await stripe.retrievePaymentIntent(clientSecret);

      if (error || !paymentIntent) {
        setState("failed");
        return;
      }

      switch (paymentIntent.status) {
        case "succeeded":
          setState("succeeded");
          break;

        case "processing":
          setState("processing");
          break;

        default:
          setState("failed");
      }
    }

    void retrievePayment();
  }, [clientSecret]);

  useEffect(() => {
    if (state !== "succeeded") return;

    queryClient.invalidateQueries({ queryKey: ["user-tokens"] });
    queryClient.invalidateQueries({ queryKey: ["store-items"] });
  }, [state, queryClient]);

  useEffect(() => {
    if (state === "succeeded") {
      router.replace(callbackUrl ?? "/auth/profile");
      return;
    }

    if (state === "failed" || state === "unknown") {
      const target = callbackUrl
        ? `/auth/payment?callbackUrl=${encodeURIComponent(callbackUrl)}`
        : "/auth/payment";
      router.replace(target);
    }
  }, [state, callbackUrl, router]);

  const messages: Record<PaymentState, string> = {
    loading: "Vérification de la recharge...",
    succeeded: "Recharge réussie 🎉 Redirection...",
    processing: "La recharge est en cours de traitement.",
    failed: "La recharge n'a pas abouti. Retour au paiement...",
    unknown: "Aucune recharge à vérifier. Retour au paiement...",
  };

  return (
    <section className="text-foreground h-full w-full min-h-0">
      <div className="grid sm:grid-cols-[1fr_minmax(0,560px)] sm:grid-rows-1 grid-rows-[minmax(40%,1fr)_auto] grid-cols-1 h-full w-full min-h-0 gap-px">
        <div className="bg-background w-full h-full min-h-0">
          <Model
            position={2.4}
            rotation={Math.PI * 0.4}
            model="/models/chien-place-de-jeu.glb"
            stopRotation
          />
        </div>

        <div className="w-full grid grid-rows-[auto_1fr] gap-px">
          <div className="h-full flex flex-col items-start justify-start p-4 gap-4 flex-1 bg-background">
            <H3 className="uppercase">Résultat de la recharge</H3>

            <p className="text-sm">{messages[state]}</p>

            <Separator />
          </div>

          <div className="h-full flex flex-col items-start justify-start p-4 gap-4 flex-1 bg-background">
            <p className="text-xs">Merci pour ton soutien !</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={null}>
      <PaymentResult />
    </Suspense>
  );
}
