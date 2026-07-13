import { H2 } from "@/components/h2";
import Link from "next/link";

export default function Shrine() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2 p-4">
      <H2 className="bg-background col-span-2 sm:col-span-2 xl:col-span-6 order-first sm:order-0 p-2">
        <Link href="/">STOKHASTIK</Link>{" "}
        <Link href="/shrine">
          <span className="text-xs text-blue-400">SHRINE</span>
        </Link>
      </H2>
      <Link
        href="/"
        className="text-xs uppercase block sm:w-50 w-full cursor-pointer text-center border border-foreground font-mono p-1 hover:underline"
      >
        Back
      </Link>
    </div>
  );
}
