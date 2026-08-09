import { Details } from "@/components/details";
import { H4 } from "@/components/h4";
import { Model } from "@/components/model";
import { prisma } from "@/libs/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ item: string }>;
}) {
  const itemId = (await params).item;
  const item = await prisma.storeItem.findUnique({ where: { id: itemId } });

  if (!item) {
    notFound();
  }

  return (
    <div className="text-foreground h-full w-full min-h-0">
      <div className="grid sm:grid-cols-[1fr_minmax(0,560px)] sm:grid-rows-1 grid-rows-[minmax(40%,1fr)_auto] grid-cols-1 h-full w-full min-h-0 gap-px">
        <div className="bg-background w-full h-full min-h-0">
          <Model
            position={item.position}
            rotation={item.rotation}
            model={item.model}
          />
        </div>

        <div className="w-full grid grid-rows-[auto_1fr] gap-px max-h-full overflow-y-auto">
          <div className="h-full flex flex-col items-start justify-start p-4 gap-4 flex-1 bg-background">
            <Suspense fallback={null}>
              <Details id={itemId} />
            </Suspense>
          </div>
          <div className="h-full flex flex-col items-start justify-start p-4 gap-4 flex-1 bg-background">
            <H4 className="uppercase text-left">Comment ça marche ?</H4>
            <ul className="text-xs list-decimal list-outside pl-6 flex flex-col gap-1 text-pretty">
              <li>
                Chaque item est unique et ne peut être acheté qu'une seule fois.
              </li>
              <li>
                Après l'achat, l'item sera virtuellement disponible dans{" "}
                <Link href="/auth/profile" className="underline">
                  ton profil
                </Link>
                .
              </li>
              <li>
                Tu recevras physiquement l'item à mon retour du Japon, à partir
                d'octobre 2026.
              </li>
              <li>
                La différence entre le prix d'achat de l'objet et son prix de
                vente contribue à financer ce projet de recherche et mon séjour
                d'études au Japon.
              </li>
            </ul>
            <p className="font-mono text-xs text-left text-pretty">
              De nouveaux items seront ajoutés régulièrement tout au long de mon
              séjour. Tu peux{" "}
              <Link href="/auth/profile" className="underline">
                t'inscrire à la newsletter
              </Link>{" "}
              pour être prévenu·e lors de leur mise en ligne.
            </p>
            <p className="font-mono text-xs text-left text-pretty">
              Pour toute question ou en cas de problème, tu peux me contacter à
              l'adresse suivante{" "}
              <Link href="mailto:hey@tekh.studio" className="underline">
                hey[@]tekh.studio
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ item: string }>;
}) {
  const itemId = (await params).item;
  const item = await prisma.storeItem.findUnique({ where: { id: itemId } });

  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://stokhastik.xyz"
      : "http://localhost:3000";

  if (!item) {
    return {
      title: "Article non trouvé",
      description: "L'article que vous recherchez n'existe pas.",
    };
  }

  return {
    title: `Stokhastik - Store - ${item.name}`,
    description: item.description ?? undefined,
    openGraph: {
      title: item.name,

      description: item.description ?? undefined,

      images: [
        {
          url: baseUrl + item.thumbnail,
          alt: item.name,
          width: 1920,
          height: 1920,
        },
      ],
    },
  };
}
