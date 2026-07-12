import { H2 } from "@/components/H2";
import { Model } from "@/components/model";
import { items } from "@/data/items";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ item: string }>;
}) {
  const itemId = (await params).item;
  const item = items.find((i) => i.id === itemId);

  if (!item) {
    notFound();
  }

  return (
    <div className="bg-background text-foreground p-2 h-full w-full min-h-0">
      <div className="grid sm:grid-cols-2 sm:grid-rows-1 grid-rows-[minmax(0,1fr)_auto] grid-cols-1 h-full w-full min-h-0">
        <div className="w-full h-full min-h-0">
          <Model item={item} />
        </div>
        <div className="h-full w-full flex flex-col items-start justify-center p-2 gap-2 flex-1">
          <H2 className="uppercase">{item.name}</H2>
          <p className="font-mono text-sm">{item.description}</p>
          <p className="font-mono text-xs uppercase">
            {item.price.toLocaleString("fr-CH", {
              style: "currency",
              currency: "CHF",
            })}
          </p>
          <div className="flex gap-4 w-full items-center">
            <button className="bg-foreground text-background hover:bg-background hover:text-foreground border border-foreground font-mono text-xs uppercase p-1 block sm:w-50 w-full cursor-pointer text-center hover:underline">
              I&apos;ll buy it!
            </button>
            <Link
              href="/store"
              className="text-xs uppercase block sm:w-50 w-full cursor-pointer text-center border border-foreground font-mono p-1 hover:underline"
            >
              Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return items.map((item) => ({ item: item.id.toString() }));
}
