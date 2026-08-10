import { H3 } from "@/components/common/h3";
import { AdminTransactionList } from "@/components/admin/transaction-list";
import { prisma } from "@/libs/prisma";
import Link from "next/link";

export default async function AdminPage() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  return (
    <section className="text-foreground bg-background h-full w-full min-h-0 flex flex-col items-start gap-4 p-4 overflow-y-auto">
      <H3 className="uppercase">Admin</H3>
      <div className="w-full flex flex-col items-start gap-4">
        <Link
          href="/admin/store-items/new"
          className="font-mono text-xs uppercase underline"
        >
          + Ajouter un item
        </Link>

        <p className="font-mono text-xs uppercase">Transactions</p>
        <AdminTransactionList transactions={transactions} />
      </div>
    </section>
  );
}
