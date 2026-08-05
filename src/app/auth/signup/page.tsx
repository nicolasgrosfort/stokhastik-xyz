import { SignUpForm } from "@/components/auth/signup-form";
import { authOptions } from "@/libs/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (session) {
    const { callbackUrl } = await searchParams;
    redirect(callbackUrl ?? "/");
  }

  return <SignUpForm />;
}
