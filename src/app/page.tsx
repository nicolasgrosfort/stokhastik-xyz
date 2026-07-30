import { H1 } from "@/components/h1";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2 p-4">
      <H1 className="uppercase">Stokhastik</H1>
      <p className="text-center font-mono max-w-sm">
        Stokhastik est un espace à multiple fonction. Il est à la fois un outil
        de recherche et un outil de retranscription de cette dernière. Un espace
        pour penser et pour communiquer. Un espace vivant.
      </p>
      <div className="flex gap-4">
        <Link
          href="/shrine"
          className="text-blue-400 hover:underline font-mono font-bold uppercase"
        >
          Sanctuaire
        </Link>
        <Link
          href="/garden"
          className="text-green-400 hover:underline font-mono font-bold uppercase"
        >
          Jardin
        </Link>
        <Link
          href="/store"
          className="text-orange-400 hover:underline font-mono font-bold uppercase"
        >
          Boutique
        </Link>
      </div>
    </div>
  );
}
