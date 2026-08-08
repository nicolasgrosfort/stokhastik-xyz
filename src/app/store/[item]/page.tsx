import { Details } from "@/components/details";
import { Model } from "@/components/model";
import { prisma } from "@/libs/prisma";
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
      <div className="grid sm:grid-cols-[1fr_minmax(0,560px)] sm:grid-rows-1 grid-rows-[minmax(160px,1fr)_auto] grid-cols-1 h-full w-full min-h-0 gap-px">
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
            <p className="text-xs">
              Chaque item est unique et ne peut être acheté qu'une seule
              fois.{" "}
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
