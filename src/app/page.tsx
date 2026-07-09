import { H1 } from "@/components/H1";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2">
      <H1>Stokhastik</H1>
      <p>Stokhastik is a space to host prototypes and research progress.</p>
      <div className="flex gap-2">
        <Link
          href="/shrine"
          className="text-blue-500 hover:underline font-mono"
        >
          Shrine
        </Link>
        <Link
          href="/garden"
          className="text-green-500 hover:underline font-mono"
        >
          Garden
        </Link>
        <Link
          href="/store"
          className="text-orange-500 hover:underline font-mono"
        >
          Store
        </Link>
      </div>
    </div>
  );
}
