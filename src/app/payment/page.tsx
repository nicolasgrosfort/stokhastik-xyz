import Payment from "@/components/payment/payment";
import { authOptions } from "@/libs/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function PaymentPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=/payment");
  }

  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground">
      <div className="mx-auto max-w-xl">
        <header className="mb-10">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em]">
            Recharge
          </p>

          <h1 className="text-4xl font-semibold tracking-tight">
            Acheter des STKH
          </h1>

          <p className="mt-3">
            Choisis un pack, puis règle directement depuis cette page.
          </p>
        </header>

        <Payment />
      </div>
    </main>
  );
}
