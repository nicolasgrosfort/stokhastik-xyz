import { H2 } from "@/components/H2";
import Link from "next/link";

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
          STORE
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
          {Array.from({ length: 16 }).map((_, item) => (
            <article key={item} className="aspect-3/4 bg-white p-2"></article>
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
