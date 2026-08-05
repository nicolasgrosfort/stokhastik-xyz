"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<PaymentState>("loading");

  const clientSecret = searchParams.get("payment_intent_client_secret");

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

  const messages: Record<PaymentState, string> = {
    loading: "Vérification du paiement…",
    succeeded: "Paiement réussi.",
    processing: "Le paiement est en cours de traitement.",
    failed: "Le paiement n'a pas abouti.",
    unknown: "Aucun paiement à vérifier.",
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div className="w-full max-w-md bg-background p-8">
        <h1 className="text-2xl font-semibold">{messages[state]}</h1>

        <a
          href="/payment"
          className="mt-8 inline-block border border-foreground px-5 py-3 font-mono text-sm uppercase"
        >
          Retour
        </a>
      </div>
    </main>
  );
}
