import { sendRechargeEmail } from "@/libs/mail";
import { getPackById, isPackId } from "@/libs/pack";
import { prisma } from "@/libs/prisma";
import { stripe } from "@/libs/stripe";
import { Prisma } from "@prisma/client";
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

  console.log("Événement Stripe reçu :", event.type);

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { packId, tokens, userId } = paymentIntent.metadata;

      if (!isPackId(packId) || !tokens || !userId) {
        console.error(
          "Métadonnées invalides ou manquantes sur le paiement Stripe :",
          paymentIntent.id,
        );
        break;
      }

      const pack = getPackById(packId);

      try {
        await prisma.$transaction([
          prisma.transaction.create({
            data: {
              userId,
              type: "PURCHASE",
              status: "SUCCEEDED",
              packId,
              tokens: Number(tokens),
              amount: paymentIntent.amount,
              stripePaymentIntentId: paymentIntent.id,
              description: `Recharge — pack ${pack.id}`,
            },
          }),
          prisma.user.update({
            where: { id: userId },
            data: { tokens: { increment: Number(tokens) } },
          }),
        ]);
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          // Événement déjà traité (livraison dupliquée du webhook).
          break;
        }

        throw error;
      }

      try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (user?.email) {
          await sendRechargeEmail({
            to: user.email,
            firstName: user.firstName ?? "",
            tokens: Number(tokens),
            amount: paymentIntent.amount,
          });
        }
      } catch (error) {
        console.error("Erreur envoi email de recharge :", error);
      }

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
