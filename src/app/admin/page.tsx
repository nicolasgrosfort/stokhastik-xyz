import { AdminStoreItemList } from "@/components/admin/store-item-list";
import { AdminTransactionList } from "@/components/admin/transaction-list";
import { AdminUserList } from "@/components/admin/user-list";
import { H3 } from "@/components/common/h3";
import { H4 } from "@/components/common/h4";
import { prisma } from "@/libs/prisma";
import { getStoreItemArgs } from "@/libs/store-item";
import { getTransactionArgs } from "@/libs/transaction";
import { getUserArgs } from "@/libs/user";
import Link from "next/link";

export default async function AdminPage() {
  const [transactions, storeItems, users] = await Promise.all([
    prisma.transaction.findMany(getTransactionArgs),
    prisma.storeItem.findMany(getStoreItemArgs),
    prisma.user.findMany(getUserArgs),
  ]);

  return (
    <section className="text-foreground bg-background h-full w-full min-h-0 flex flex-col items-start gap-4 p-4 overflow-y-auto">
      <H3 className="uppercase">Admin</H3>
      <div className="w-full flex flex-col items-start gap-4">
        <div className="w-full flex items-center justify-between">
          <H4 className="uppercase">Store</H4>
          <Link
            href="/admin/store-items/new"
            className="font-mono text-xs uppercase underline"
          >
            + Ajouter un item
          </Link>
        </div>
        <AdminStoreItemList items={storeItems} />

        <H4 className="uppercase">Utilisateurs</H4>
        <AdminUserList users={users} />

        <H4 className="uppercase">Transactions</H4>
        <AdminTransactionList transactions={transactions} />
      </div>
    </section>
  );
}
