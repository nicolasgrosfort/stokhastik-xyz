"use client";

import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { PAYMENT_STATUS_STORAGE_KEY } from "@/libs/payment-status";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";

type CheckoutFormProps = {
  onCancel: () => void;
  callbackUrl?: string;
};

export default function CheckoutForm({
  onCancel,
  callbackUrl,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPaying, setIsPaying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stripe || !elements || isPaying) {
      return;
    }

    setIsPaying(true);
    setMessage(null);

    try {
      const target = callbackUrl ?? "/auth/profile";
      const returnUrl = new URL(target, window.location.origin);

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl.toString(),
        },
        redirect: "if_required",
      });

      if (error) {
        setMessage(error.message ?? "Le paiement n'a pas pu être confirmé.");
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        queryClient.invalidateQueries({ queryKey: ["user-tokens"] });
        queryClient.invalidateQueries({ queryKey: ["store-items"] });
        sessionStorage.setItem(PAYMENT_STATUS_STORAGE_KEY, "succeeded");
        router.push(target);
        return;
      }

      if (paymentIntent?.status === "processing") {
        setMessage("La recharge est en cours de traitement.");
        return;
      }

      setMessage("Le paiement n'a pas abouti.");
    } catch (error) {
      console.error(error);
      setMessage("Une erreur est survenue pendant le paiement.");
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {message && (
        <p role="status" className=" text-xs pt-4">
          {message}
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-2">
        <button
          type="submit"
          disabled={!stripe || !elements || isPaying}
          className="bg-foreground text-background border border-foreground font-mono text-xs uppercase p-1 block w-full cursor-pointer text-center hover:underline"
        >
          {isPaying ? "Paiement…" : "Payer"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPaying}
          className="flex items-center justify-center text-xs uppercase w-full cursor-pointer text-center border border-foreground font-mono p-1 hover:underline"
        >
          Retour aux packs
        </button>
      </div>
    </form>
  );
}
