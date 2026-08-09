import { TransactionHistory } from "@/components/auth/transaction-history";
import { H3 } from "@/components/h3";
import { Model } from "@/components/model";
import Payment from "@/components/payment/payment";
import { authOptions } from "@/libs/auth";
import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { callbackUrl } = await searchParams;
  const safeCallbackUrl =
    callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : undefined;

  if (!session) {
    const target = safeCallbackUrl
      ? `/auth/payment?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`
      : "/auth/payment";
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(target)}`);
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="text-foreground h-full w-full min-h-0">
      <div className="grid sm:grid-cols-[1fr_minmax(0,560px)] sm:grid-rows-1 grid-rows-[minmax(40%,1fr)_auto] grid-cols-1 h-full w-full min-h-0 gap-px">
        <div className="bg-background w-full h-full min-h-0">
          <Model
            position={2}
            rotation={Math.PI * -0.5}
            model="/models/saisen-bako.glb"
            stopRotation={false}
          />
        </div>

        <div className="w-full grid grid-rows-[auto_1fr] gap-px max-h-full overflow-y-auto">
          <div className="h-full flex flex-col items-start justify-start p-4 gap-4 flex-1 bg-background">
            <H3 className="uppercase">Recharger mon compte</H3>
            <Payment callbackUrl={safeCallbackUrl} />
          </div>

          <div className="h-full flex flex-col items-start justify-start p-4 gap-4 flex-1 bg-background">
            <H3 className="uppercase">Transactions</H3>
            <TransactionHistory transactions={transactions} />
          </div>
        </div>
      </div>
    </section>
  );
}
