"use client";

import { Separator } from "@/components/common/separator";
import CheckoutForm from "@/components/payment/checkout-form";
import { PackId, packs, tokensToCHF } from "@/libs/pack";
import { Elements } from "@stripe/react-stripe-js";
import {
  Appearance,
  loadStripe,
  StripeElementsOptions,
} from "@stripe/stripe-js";
import Link from "next/link";
import { useMemo, useState } from "react";

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

function buildAppearance(): Appearance {
  const styles = getComputedStyle(document.documentElement);
  const foreground = styles.getPropertyValue("--color-foreground").trim();
  const background = styles.getPropertyValue("--color-background").trim();
  const danger = styles.getPropertyValue("--color-red-500").trim();

  return {
    variables: {
      colorPrimary: foreground,
      colorBackground: background,
      colorText: foreground,
      colorTextSecondary: foreground,
      colorDanger: danger,

      fontFamily:
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",

      borderRadius: "0px",
      spacingUnit: "4px",
    },

    rules: {
      ".Input": {
        border: `1px solid ${foreground}`,
        boxShadow: "none",
        backgroundColor: background,
        padding: "8px",
      },

      ".Input:focus": {
        border: `1px solid ${foreground}`,
        boxShadow: "none",
      },

      ".Label": {
        fontSize: "12px",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      },

      ".Tab": {
        border: `1px solid ${foreground}`,
        boxShadow: "none",
      },

      ".Tab--selected": {
        border: `1px solid ${foreground}`,
        boxShadow: "none",
      },
    },
  };
}

export default function Payment() {
  const [selectedPack, setSelectedPack] = useState<PackId>("small");
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

  const options: StripeElementsOptions | undefined = useMemo(
    () =>
      clientSecret
        ? {
            clientSecret,
            appearance: buildAppearance(),
            loader: "auto",
          }
        : undefined,
    [clientSecret],
  );

  return (
    <section className="w-full flex flex-col gap-2">
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
                "border p-2 text-left transition cursor-pointer",
                isSelected
                  ? "bg-foreground text-background"
                  : "border-foreground bg-background text-foreground",
              ].join(" ")}
            >
              <span className="block font-semibold">
                {pack.tokens.toLocaleString("fr-CH")}
              </span>
              <span className="block font-mono text-xs uppercase">STKH</span>
              <span className="mt-4 block text-sm">
                {tokensToCHF(pack.tokens)} CHF
              </span>
            </button>
          );
        })}
      </div>

      <Separator />

      {!clientSecret && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={preparePayment}
            disabled={isLoading}
            className="bg-foreground text-background border border-foreground font-mono text-xs uppercase p-1 block w-full cursor-pointer text-center hover:underline"
          >
            {isLoading
              ? "Chargement..."
              : `Recharger · ${(packs.find((p) => p.id === selectedPack)?.tokens ?? 0).toLocaleString("fr-CH")} STKH`}
          </button>
          <Link
            href="/auth/profile"
            className="flex items-center justify-center text-xs uppercase w-full cursor-pointer text-center border border-foreground font-mono p-1 hover:underline"
          >
            Retour
          </Link>
        </div>
      )}

      {error && (
        <p role="alert" className="text-red-500">
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
