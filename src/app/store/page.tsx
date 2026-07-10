import { H2 } from "@/components/H2";
import { BLANK_ITEM, Item } from "@/components/Item";
import { padArray } from "@/libs/utils";
import Link from "next/link";

const items: Item[] = [
  {
    id: "1",
    name: "Giraffe",
    model: "/models/giraffe.glb",
    price: 50,
    position: 1,
    rotation: Math.PI * 0.4,
    status: "available",
    description:
      "A giraffe is an African even-toed ungulate mammal, the tallest living terrestrial animal and the largest ruminant.",
  },
  {
    id: "2",
    name: "Rock",
    model: "/models/caillou.glb",
    price: 30,
    position: 5,
    rotation: Math.PI * 1.25,
    status: "available",
    description:
      "A rock is a naturally occurring solid aggregate of minerals or mineraloid matter.",
  },
  {
    id: "3",
    name: "Tree",
    model: "/models/arbre.glb",
    price: 20,
    position: 6,
    rotation: Math.PI * 1.25,
    status: "available",
    description:
      "A rock is a naturally occurring solid aggregate of minerals or mineraloid matter.",
  },
  {
    id: "4",
    name: "Chocolate",
    model: "/models/chocolat.glb",
    price: 60,
    position: 1,
    rotation: Math.PI * 1.25,
    status: "available",
    description:
      "A rock is a naturally occurring solid aggregate of minerals or mineraloid matter.",
  },
];

export default function Store() {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] bg-black">
      <header className="sticky top-0 z-10 grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-px bg-black border-b border-px border-black">
        <Link
          href="#"
          className="bg-white text-black hover:underline hover:bg-black hover:text-white p-1 w-full text-xs h-full flex items-center justify-center"
        >
          ABOUT
        </Link>
        <H2 className="bg-white col-span-2 sm:col-span-2 xl:col-span-6 order-first sm:order-0 p-2">
          STOKHASTIK <span className="text-xs text-orange-400">STORE</span>
        </H2>
        <Link
          href="/"
          className="bg-white text-black hover:underline hover:bg-black hover:text-white p-1 w-full text-xs h-full flex items-center justify-center"
        >
          BACK
        </Link>
      </header>

      <main className="flex flex-col min-h-full h-full">
        <div className="grid content-start gap-px bg-black grid-cols-2 sm:grid-cols-4 xl:grid-cols-8">
          {padArray(items, 8, BLANK_ITEM).map((item, id) => (
            <article key={id} className="aspect-3/4 bg-white ">
              <Item item={item} />
            </article>
          ))}
        </div>

        <div className="flex-1 bg-white border-t border-px border-black p-2">
          Stats
        </div>
      </main>

      <footer className="sticky bottom-0 z-10 bg-white border-t border-px border-black p-2">
        Footer
      </footer>
    </div>
  );
}
