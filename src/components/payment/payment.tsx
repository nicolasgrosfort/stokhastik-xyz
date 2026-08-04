"use client";

import CheckoutForm from "@/components/payment/checkout-form";
import { PackId, packs, tokensToCHF } from "@/libs/pack";
import { Elements } from "@stripe/react-stripe-js";
import {
  Appearance,
  loadStripe,
  StripeElementsOptions,
} from "@stripe/stripe-js";
import { useState } from "react";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined in the environment variables.",
  );
}

const stripePromise = loadStripe(publishableKey);

type PaymentIntentResponse = {
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
};

const appearance: Appearance = {
  theme: "night",

  variables: {
    colorPrimary: "var(--color-foreground)",
    colorBackground: "var(--color-background)",
    colorText: "var(--color-foreground)",
    colorTextSecondary: "var(--color-foreground-muted)",
    colorDanger: "var(--color-red-500)",

    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",

    borderRadius: "0px",
    spacingUnit: "4px",
  },

  rules: {
    ".Input": {
      border: "1px solid #404040",
      boxShadow: "none",
      padding: "14px",
    },

    ".Input:focus": {
      border: "1px solid #ffffff",
      boxShadow: "none",
    },

    ".Label": {
      fontSize: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    },

    ".Tab": {
      border: "1px solid #404040",
      boxShadow: "none",
    },

    ".Tab:hover": {
      border: "1px solid #737373",
    },

    ".Tab--selected": {
      border: "1px solid #ffffff",
      boxShadow: "none",
    },
  },
};

export default function Payment() {
  const [selectedPack, setSelectedPack] = useState<PackId>("medium");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function preparePayment() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packId: selectedPack,
        }),
      });

      const data = (await response.json()) as PaymentIntentResponse;

      if (!response.ok || !data.clientSecret) {
        throw new Error(data.error ?? "Impossible de préparer le paiement.");
      }

      setClientSecret(data.clientSecret);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function changePack(packId: PackId) {
    setSelectedPack(packId);
    setClientSecret(null);
    setError(null);
  }

  const options: StripeElementsOptions | undefined = clientSecret
    ? {
        clientSecret,
        appearance,
        loader: "auto",
      }
    : undefined;

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-4 gap-2">
        {packs.map((pack) => {
          const isSelected = pack.id === selectedPack;

          return (
            <button
              key={pack.id}
              type="button"
              onClick={() => changePack(pack.id)}
              disabled={isLoading}
              className={[
                "border p-4 text-left transition",
                isSelected
                  ? "border-white bg-white text-black"
                  : "border-neutral-700 bg-neutral-900 hover:border-neutral-500",
              ].join(" ")}
            >
              <span className="block text-xl font-semibold">{pack.tokens}</span>

              <span className="mt-1 block font-mono text-xs uppercase opacity-70">
                STKH
              </span>

              <span className="mt-4 block text-sm">
                {tokensToCHF(pack.tokens)} CHF
              </span>
            </button>
          );
        })}
      </div>

      {!clientSecret && (
        <button
          type="button"
          onClick={preparePayment}
          disabled={isLoading}
          className="w-full bg-white px-5 py-4 font-mono text-sm font-bold uppercase text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Préparation…" : "Continuer vers le paiement"}
        </button>
      )}

      {error && (
        <p
          role="alert"
          className="border border-red-900 bg-red-950/40 p-4 text-sm text-red-300"
        >
          {error}
        </p>
      )}

      {clientSecret && options && (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm onCancel={() => setClientSecret(null)} />
        </Elements>
      )}
    </section>
  );
}
