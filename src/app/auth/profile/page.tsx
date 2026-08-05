import { SignOutButton } from "@/components/auth/signout-button";
import { FormatedDate } from "@/components/formated-date";
import { H1 } from "@/components/h1";
import { authOptions } from "@/libs/auth";
import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { redirect } from "next/navigation";

const statusLabels = {
  PENDING: "En attente",
  SUCCEEDED: "Réussi",
  FAILED: "Échoué",
};

const typeLabels = {
  PURCHASE: "Recharge",
  SPEND: "Achat",
  REFUND: "Remboursement",
  BONUS: "Bonus",
  ADJUSTMENT: "Ajustement",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/auth/signin?callbackUrl=/profile");
  }

  const history = user.transactions;

  return (
    <section className="flex flex-col items-center justify-center gap-4 h-full p-4 bg-background">
      <H1>Mon profil</H1>

      <div className="flex flex-col gap-4 sm:max-w-104 w-full font-mono text-sm">
        <div>
          <p className="text-xs uppercase font-bold">Prénom</p>
          <p>{user.firstName}</p>
        </div>

        <div>
          <p className="text-xs uppercase font-bold">Nom</p>
          <p>{user.lastName}</p>
        </div>

        <div>
          <p className="text-xs uppercase font-bold">Email</p>
          <p>{user.email}</p>
        </div>

        <div>
          <p className="text-xs uppercase font-bold">Solde</p>
          <p>{user.tokens} STKH</p>
        </div>

        <Link
          href="/payment"
          className="bg-foreground text-background hover:bg-background hover:text-foreground border border-foreground font-mono text-xs uppercase p-1 block w-full cursor-pointer text-center hover:underline"
        >
          Recharger mon compte
        </Link>

        <div>
          <p className="text-xs uppercase font-bold mb-2">Transactions</p>

          {history.length === 0 ? (
            <p className="text-xs">Aucune transaction pour l&apos;instant.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-2 border border-dark-green p-2 text-xs"
                >
                  <FormatedDate date={entry.createdAt} />
                  <span>
                    {entry.tokens >= 0 ? "+" : ""}
                    {entry.tokens} STKH
                  </span>
                  <span>
                    {entry.amount !== null
                      ? `${(entry.amount / 100).toFixed(2)} CHF`
                      : entry.description}
                  </span>
                  <span>
                    {typeLabels[entry.type]}
                    {entry.status !== "SUCCEEDED"
                      ? ` — ${statusLabels[entry.status]}`
                      : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <SignOutButton />
      </div>
    </section>
  );
}
