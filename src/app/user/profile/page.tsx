import { SignOutButton } from "@/components/auth/signout-button";
import { FormatedDate } from "@/components/common/formated-date";
import { H3 } from "@/components/common/h3";
import { H4 } from "@/components/common/h4";
import { Model } from "@/components/common/model";
import { Separator } from "@/components/common/separator";
import { ProfileBalance } from "@/components/user/profile-balance";
import { ProfileNewsletter } from "@/components/user/profile-newsletter";
import { authOptions } from "@/libs/auth";
import { prisma } from "@/libs/prisma";
import { formatSwissNumber } from "@/libs/utils";
import { getServerSession } from "next-auth/next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=/user/profile");
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
    redirect("/auth/signin?callbackUrl=/user/profile");
  }

  return (
    <section className="text-foreground h-full w-full min-h-0">
      <div className="grid sm:grid-cols-[1fr_minmax(0,40%)] sm:grid-rows-1 grid-rows-[minmax(40%,1fr)_auto] grid-cols-1 h-full w-full min-h-0 gap-px">
        <div className="bg-background w-full h-full min-h-0">
          <Model
            position={2.5}
            rotation={Math.PI * 0.5}
            model="/models/lion-temple-kurama.glb"
            stopRotation={false}
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
                  href="/user/payment"
                  className="bg-foreground text-background border border-foreground font-mono text-xs uppercase p-1 block w-full cursor-pointer text-center hover:underline"
                >
                  Recharger mon compte
                </Link>

                <SignOutButton />
              </div>
            </div>
          </div>

          <div className="h-full flex flex-col items-start justify-start flex-1 bg-background p-4 gap-2">
            <H4 className="uppercase text-left">Mes items</H4>

            {user.storeItems.length > 0 ? (
              <>
                <Separator />
                <div className="grid grid-cols-3 gap-px bg-foreground w-full ">
                  {user.storeItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/store/${item.slug}`}
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
                            {formatSwissNumber(item.price)} STKH
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
                <Separator />
              </>
            ) : (
              <p className="font-mono text-xs bg-background h-full w-full">
                Aucun item acheté pour le moment.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
