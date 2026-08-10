import { SignInForm } from "@/components/auth/signin-form";
import { authOptions } from "@/libs/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (session) {
    const { callbackUrl } = await searchParams;
    redirect(callbackUrl ?? "/user/profile");
  }

  return <SignInForm />;
}
