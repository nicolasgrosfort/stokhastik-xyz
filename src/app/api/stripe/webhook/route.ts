import { stripe } from "@/libs/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error(
      "STRIPE_WEBHOOK_SECRET is not defined in the environment variables.",
    );

    return NextResponse.json(
      {
        error: "Webhook non configuré.",
      },
      {
        status: 500,
      },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      {
        error: "Signature Stripe manquante.",
      },
      {
        status: 400,
      },
    );
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Signature du webhook invalide :", error);

    return NextResponse.json(
      {
        error: "Signature invalide.",
      },
      {
        status: 400,
      },
    );
  }

  console.log("Hello world");
  console.log("Événement Stripe reçu :", event.type);

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      console.log("Hello world — paiement réussi", {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
      });

      // Plus tard :
      //
      // const userId = paymentIntent.metadata.userId;
      // const tokens = Number(paymentIntent.metadata.tokens);
      //
      // await creditTokens({
      //   userId,
      //   tokens,
      //   paymentIntentId: paymentIntent.id,
      // });

      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      console.log("Paiement échoué :", paymentIntent.id);
      break;
    }

    default:
      console.log(`Événement non traité : ${event.type}`);
  }

  return NextResponse.json({
    received: true,
  });
}
