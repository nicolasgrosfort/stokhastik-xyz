"use client";

import { Scramble } from "@/components/common/scramble";
import { PAYMENT_STATUS_STORAGE_KEY } from "@/libs/payment-status";
import { loadStripe } from "@stripe/stripe-js";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

type Status = "succeeded" | "processing" | "failed";

const messages: Record<Status, string> = {
  succeeded: "Recharge réussie !",
  processing: "Recharge en cours de traitement.",
  failed: "Le paiement n'a pas abouti.",
};

type PaymentStatusMessageProps = {
  className?: string;
  fallback: ReactNode;
};

export function PaymentStatusMessage({
  className,
  fallback,
}: PaymentStatusMessageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Status | null>(null);

  const clientSecret = searchParams.get("payment_intent_client_secret");

  useEffect(() => {
    if (!clientSecret || !stripePromise) return;

    const secret = clientSecret;
    let cancelled = false;

    async function check() {
      const url = new URL(window.location.href);
      url.searchParams.delete("payment_intent");
      url.searchParams.delete("payment_intent_client_secret");
      url.searchParams.delete("redirect_status");
      const cleanPath = `${url.pathname}${url.search}`;

      const stripe = await stripePromise;
      const result = stripe
        ? await stripe.retrievePaymentIntent(secret)
        : { paymentIntent: undefined, error: undefined };

      if (cancelled) return;

      if (!stripe || result.error || !result.paymentIntent) {
        setStatus("failed");
        router.replace(
          `/auth/payment?callbackUrl=${encodeURIComponent(url.pathname)}`,
        );
        return;
      }

      switch (result.paymentIntent.status) {
        case "succeeded":
          setStatus("succeeded");
          queryClient.invalidateQueries({ queryKey: ["user-tokens"] });
          queryClient.invalidateQueries({ queryKey: ["store-items"] });
          router.replace(cleanPath);
          break;

        case "processing":
          setStatus("processing");
          router.replace(cleanPath);
          break;

        default:
          setStatus("failed");
          router.replace(
            `/auth/payment?callbackUrl=${encodeURIComponent(url.pathname)}`,
          );
      }
    }

    void check();

    return () => {
      cancelled = true;
    };
  }, [clientSecret, router, queryClient]);

  useEffect(() => {
    const stored = sessionStorage.getItem(PAYMENT_STATUS_STORAGE_KEY);
    if (stored !== "succeeded") return;

    sessionStorage.removeItem(PAYMENT_STATUS_STORAGE_KEY);
    setStatus("succeeded");
  }, [pathname]);

  useEffect(() => {
    if (!status) return;

    const timeout = setTimeout(() => setStatus(null), 6000);
    return () => clearTimeout(timeout);
  }, [status]);

  return (
    <p role="status" className={className}>
      {status ? (
        <Scramble key={status} scrambleOnMount>
          {messages[status]}
        </Scramble>
      ) : (
        fallback
      )}
    </p>
  );
}
