import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full h-full grid grid-cols-3 grid-rows-[auto_1fr] gap-px">
      <div className="col-span-3 text-foreground bg-background p-2 text-sm">
        Stokhastik est un espace à multiple fonction. Il est à la fois un outil
        de recherche et un outil de retranscription de cette dernière. Un espace
        pour penser et pour communiquer. Un espace vivant.
      </div>
      <div className="text-foreground bg-background flex items-center justify-center">
        <Link
          href="/shrine"
          className="text-blue-400 hover:underline font-mono font-bold uppercase"
        >
          SHRINE
        </Link>
      </div>
      <div className="text-foreground bg-background flex items-center justify-center">
        <Link
          href="/garden"
          className="text-green-400 hover:underline font-mono font-bold uppercase"
        >
          GARDEN
        </Link>
      </div>
      <div className="text-foreground bg-background flex items-center justify-center">
        <Link
          href="/store"
          className="text-orange-400 hover:underline font-mono font-bold uppercase"
        >
          STORE
        </Link>
      </div>
    </div>
  );
}
