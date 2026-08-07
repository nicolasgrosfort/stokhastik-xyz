import { ProfileBalance } from "@/components/auth/profile-balance";
import { SignOutButton } from "@/components/auth/signout-button";
import { TransactionHistory } from "@/components/auth/transaction-history";
import { Separator } from "@/components/common/separator";
import { H3 } from "@/components/h3";
import { Model } from "@/components/model";
import { authOptions } from "@/libs/auth";
import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { redirect } from "next/navigation";

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
      <div className="grid sm:grid-cols-[1fr_minmax(0,560px)] sm:grid-rows-1 grid-rows-[minmax(160px,1fr)_auto] grid-cols-1 h-full w-full min-h-0 gap-px">
        <div className="bg-background w-full h-full min-h-0">
          <Model
            position={1.25}
            rotation={Math.PI * 0.5}
            model="/models/cone-interdit-fumer.glb"
            stopRotation
          />
        </div>

        <div className="w-full grid grid-rows-[auto_1fr] gap-px">
          <div className="h-full flex flex-col items-start justify-start p-4 gap-4 flex-1 bg-background">
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

              <Separator />

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/payment"
                  className="bg-foreground text-background border border-foreground font-mono text-xs uppercase p-1 block w-full cursor-pointer text-center hover:underline"
                >
                  Recharger mon compte
                </Link>

                <SignOutButton />
              </div>
            </div>
          </div>

          <div className="h-full flex flex-col items-start justify-start p-4 gap-4 flex-1 bg-background">
            <H3 className="uppercase text-left">Transactions</H3>
            <TransactionHistory transactions={history} />
          </div>
        </div>
      </div>
    </section>
  );
}
