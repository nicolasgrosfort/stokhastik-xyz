"use client";

import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { SubmitEvent, useState } from "react";

type CheckoutFormProps = {
  onCancel: () => void;
};

export default function CheckoutForm({ onCancel }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
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
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/result`,
        },
      });

      if (error) {
        setMessage(error.message ?? "Le paiement n'a pas pu être confirmé.");
        return;
      }

      setMessage(
        "Paiement envoyé. La confirmation définitive arrivera par le webhook.",
      );
    } catch (error) {
      console.error(error);
      setMessage("Une erreur est survenue pendant le paiement.");
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-neutral-700 bg-neutral-900 p-5"
    >
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {message && (
        <p
          role="status"
          className="mt-5 border border-neutral-700 p-3 text-sm text-neutral-300"
        >
          {message}
        </p>
      )}

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPaying}
          className="border border-neutral-600 px-5 py-4 font-mono text-sm uppercase disabled:opacity-50"
        >
          Retour
        </button>

        <button
          type="submit"
          disabled={!stripe || !elements || isPaying}
          className="flex-1 bg-white px-5 py-4 font-mono text-sm font-bold uppercase text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPaying ? "Paiement…" : "Payer"}
        </button>
      </div>
    </form>
  );
}
