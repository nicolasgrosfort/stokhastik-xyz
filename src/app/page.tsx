import { H1 } from "@/components/H1";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2">
      <H1>Stokhastik</H1>
      <p>Stokhastik is a space to host prototypes and research progress.</p>
      <div className="flex gap-2">
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
