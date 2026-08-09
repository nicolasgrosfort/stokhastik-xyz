import { ProfileBalance } from "@/components/auth/profile-balance";
import { ProfileNewsletter } from "@/components/auth/profile-newsletter";
import { SignOutButton } from "@/components/auth/signout-button";
import { Separator } from "@/components/common/separator";
import { FormatedDate } from "@/components/formated-date";
import { H3 } from "@/components/h3";
import { H4 } from "@/components/h4";
import { Model } from "@/components/model";
import { authOptions } from "@/libs/auth";
import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth/next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=/auth/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
      },
      storeItems: {
        orderBy: { purchasedAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/auth/signin?callbackUrl=/auth/profile");
  }

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

        <div className="w-full grid grid-rows-[auto_1fr] gap-px max-h-full overflow-y-auto">
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

              {user.role === "ADMIN" && (
                <div>
                  <p className="text-xs uppercase font-bold">Rôle</p>
                  <Link href="/admin" className="hover:underline">
                    Administrateur
                  </Link>
                </div>
              )}

              <div>
                <ProfileNewsletter initialNewsletter={user.newsletter} />
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

          <div className="h-full flex flex-col items-start justify-start flex-1 bg-foreground gap-px">
            <H4 className="uppercase text-left p-4 bg-background w-full">
              Mes items
            </H4>
            {user.storeItems.length > 0 ? (
              <div className="grid grid-cols-3 gap-px bg-foreground w-full ">
                {user.storeItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/store/${item.id}`}
                    className="group aspect-square bg-background relative overflow-hidden"
                  >
                    <div className="absolute inset-x-0 top-0 p-2">
                      <p className="font-mono text-xs uppercase truncate">
                        {item.name}
                      </p>
                    </div>
                    <Image
                      src={item.thumbnail}
                      alt={item.name}
                      fill
                      draggable={false}
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 639px) 33vw, 186px"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-2 flex items-center justify-between gap-2">
                      {item.price && (
                        <p className="font-mono text-xs uppercase truncate">
                          {item.price.toLocaleString("fr-CH")} STKH
                        </p>
                      )}
                      {item.purchasedAt && (
                        <FormatedDate date={item.purchasedAt} />
                      )}
                    </div>
                  </Link>
                ))}

                {Array.from({
                  length: (3 - (user.storeItems.length % 3)) % 3,
                }).map((_, index) => (
                  <div
                    key={`filler-${index}`}
                    className="aspect-square bg-background"
                  />
                ))}
              </div>
            ) : (
              <p className="font-mono text-xs uppercase">
                Aucun objet acheté pour le moment.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
