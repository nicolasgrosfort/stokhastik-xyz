import { Item } from "@/components/Item";
import { items } from "@/data/items";

export default function StorePage() {
  return (
    <>
      <div className="grid content-start gap-px bg-foreground grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 h-full">
        {items.map((item, id) => (
          <article key={id} className="aspect-3/4 bg-background ">
            <Item item={item} />
          </article>
        ))}
      </div>
      <div className="flex-1 bg-background border-t border-px border-foreground p-4">
        <p className="font-mono text-xs text-center">{items.length} items</p>
      </div>
    </>
  );
}
