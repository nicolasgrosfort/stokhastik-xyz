import { H2 } from "@/components/H2";
import Link from "next/link";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full h-full grid grid-rows-[auto_minmax(0,1fr)_auto] bg-foreground flex-1">
      <header className="sticky top-0 z-10 grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-px bg-foreground border-b border-px border-foreground">
        <Link
          href="/store"
          className="bg-background text-foreground hover:underline hover:bg-foreground hover:text-background p-1 w-full text-xs h-full flex items-center justify-center"
        >
          STORE
        </Link>
        <H2 className="bg-background col-span-2 sm:col-span-2 xl:col-span-6 order-first sm:order-0 p-2">
          <Link href="/">STOKHASTIK</Link>{" "}
          <Link href="/store">
            <span className="text-xs text-orange-400">STORE</span>
          </Link>
        </H2>
        <Link
          href="/store/about"
          className="bg-background text-foreground hover:underline hover:bg-foreground hover:text-background p-1 w-full text-xs h-full flex items-center justify-center"
        >
          ABOUT
        </Link>
      </header>

      <main className="flex flex-col h-full min-h-0">{children}</main>

      <footer className="sticky bottom-0 z-10 bg-background border-t border-px border-foreground p-2">
        <p className="font-mono text-xs text-center">
          Fait avec ❤️ par{" "}
          <a
            href="https://www.tekh.studio"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            tèkh studio
          </a>
        </p>
      </footer>
    </div>
  );
}
