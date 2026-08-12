import { VerifyEmailBanner } from "@/components/user/verify-email-banner";
import { authOptions } from "@/libs/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=/user/profile");
  }

  return (
    <>
      {!session.user.emailVerified && <VerifyEmailBanner />}
      {children}
    </>
  );
}
