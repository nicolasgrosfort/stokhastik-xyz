import { sendWelcomeEmail } from "@/libs/mail";
import { prisma } from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const signInUrl = new URL("/auth/signin", request.url);

  if (!token) {
    signInUrl.searchParams.set("verifyError", "1");
    return NextResponse.redirect(signInUrl);
  }

  const user = await prisma.user.findUnique({
    where: { emailVerificationToken: token },
  });

  if (
    !user ||
    !user.emailVerificationTokenExpiresAt ||
    user.emailVerificationTokenExpiresAt < new Date()
  ) {
    signInUrl.searchParams.set("verifyError", "1");
    return NextResponse.redirect(signInUrl);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
    },
  });

  if (user.email) {
    try {
      await sendWelcomeEmail({ to: user.email, firstName: user.firstName ?? "" });
    } catch (error) {
      console.error("Erreur envoi email de bienvenue :", error);
    }
  }

  signInUrl.searchParams.set("verified", "1");
  return NextResponse.redirect(signInUrl);
}
