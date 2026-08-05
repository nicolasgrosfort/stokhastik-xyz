import { authOptions } from "@/libs/auth";
import { getPackById, isPackId, tokensToCHF } from "@/libs/pack";
import { prisma } from "@/libs/prisma";
import { stripe } from "@/libs/stripe";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Tu dois être connecté pour recharger ton compte.",
        },
        {
          status: 401,
        },
      );
    }

    const body: unknown = await request.json();

    console.log("Body reçu :", body);

    if (
      typeof body !== "object" ||
      body === null ||
      !("packId" in body) ||
      !isPackId(body.packId)
    ) {
      return NextResponse.json(
        {
          error: "Pack invalide.",
        },
        {
          status: 400,
        },
      );
    }

    const packId = body.packId;
    const pack = getPackById(packId);
    const amount = tokensToCHF(pack.tokens) * 100; // Convertir en centimes

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "chf",
      automatic_payment_methods: {
        enabled: true,
      },
      description: pack.id,
      metadata: {
        packId,
        tokens: String(pack.tokens),
        userId: session.user.id,
      },
    });

    if (!paymentIntent.client_secret) {
      throw new Error("Stripe n'a pas retourné de client secret.");
    }

    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        packId,
        tokens: pack.tokens,
        amount,
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      pack: {
        id: packId,
        amount: tokensToCHF(pack.tokens),
        tokens: pack.tokens,
        label: pack.id,
      },
    });
  } catch (error) {
    console.error("Erreur create-payment-intent :", error);

    return NextResponse.json(
      {
        error: "Impossible d'initialiser le paiement.",
      },
      {
        status: 500,
      },
    );
  }
}
