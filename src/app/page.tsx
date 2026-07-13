import { H1 } from "@/components/h1";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2 p-4">
      <H1 className="uppercase">Stokhastik</H1>
      <p className="text-center font-mono max-w-sm">
        Stokhastik is a space to host prototypes and research progress.
      </p>
      <div className="flex gap-4">
        <Link
          href="/shrine"
          className="text-blue-400 hover:underline font-mono font-bold uppercase"
        >
          Shrine
        </Link>
        <Link
          href="/garden"
          className="text-green-400 hover:underline font-mono font-bold uppercase"
        >
          Garden
        </Link>
        <Link
          href="/store"
          className="text-orange-400 hover:underline font-mono font-bold uppercase"
        >
          Store
        </Link>
      </div>
    </div>
  );
}
