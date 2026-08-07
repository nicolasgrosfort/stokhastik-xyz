import { ProfileBalance } from "@/components/auth/profile-balance";
import { SignOutButton } from "@/components/auth/signout-button";
import { FormatedDate } from "@/components/formated-date";
import { H3 } from "@/components/h3";
import { Model } from "@/components/model";
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
    <section className="text-foreground h-full w-full min-h-0">
      <div className="grid sm:grid-cols-2 sm:grid-rows-1 grid-rows-[minmax(160px,1fr)_auto] grid-cols-1 h-full w-full min-h-0 gap-px">
        <div className="bg-background w-full h-full min-h-0">
          <Model
            position={1.25}
            rotation={Math.PI * 0.5}
            model="/models/cone-interdit-fumer.glb"
            stopRotation
          />
        </div>

        <div className="w-full flex min-h-0">
          <div className="gap-px h-full w-full grid grid-rows-[auto_minmax(0px,25%)] items-start min-h-0">
            <div className="h-full w-full bg-background flex flex-col items-center justify-center gap-4 p-4">
              <div className="sm:max-w-120 w-full">
                <H3 className="uppercase text-left">Profil</H3>
                <div className="flex flex-col gap-4 w-full font-mono text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs uppercase font-bold">Prénom</p>
                      <p>{user.firstName}</p>
                    </div>

                    <div>
                      <p className="text-xs uppercase font-bold">Nom</p>
                      <p>{user.lastName}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase font-bold">Email</p>
                    <p>{user.email}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase font-bold">Solde</p>
                    <ProfileBalance initialTokens={user.tokens} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/auth/payment"
                      className="bg-foreground text-background hover:bg-background hover:text-foreground border border-foreground font-mono text-xs uppercase p-1 block w-full cursor-pointer text-center hover:underline"
                    >
                      Recharger mon compte
                    </Link>

                    <SignOutButton />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background h-full w-full min-h-0 overflow-y-auto flex flex-col items-center">
              <div className="sm:max-w-120 w-full">
                <H3 className="uppercase text-left sticky top-0 bg-background p-4">
                  Transactions
                </H3>
                {history.length === 0 ? (
                  <p className="text-xs">
                    Aucune transaction pour l&apos;instant.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2 p-4 pt-0">
                    {history.map((entry) => (
                      <div
                        key={entry.id}
                        className="grid grid-cols-4 items-center gap-4 border border-dark-green p-2 text-xs"
                      >
                        <FormatedDate date={entry.createdAt} />
                        <span className="text-left">
                          {entry.tokens >= 0 ? "+" : ""}
                          {entry.tokens} STKH
                        </span>
                        <span className="text-left">
                          {entry.amount !== null
                            ? `${(entry.amount / 100).toFixed(2)} CHF`
                            : entry.description}
                        </span>
                        <span className="text-right">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
