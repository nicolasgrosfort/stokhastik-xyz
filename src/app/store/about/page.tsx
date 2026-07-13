import { H2 } from "@/components/h2";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground p-2 h-full flex justify-center items-center">
      <div className="max-w-lg flex flex-col gap-4">
        <H2 className="uppercase text-left">ABOUT</H2>
        <p className="font-mono text-sm text-left ">
          Stokhastik Store is a financial support platform for a media design
          master&apos;s thesis research project, carried out between Geneva and
          Kyoto, from July to September 2026.
        </p>
        <div className="flex gap-4 w-full items-center justify-center">
          <Link
            href="https://github.com/nicolasgrosfort/head-md-thesis"
            target="_blank"
            rel="noopener noreferrer"
            className="uppercase text-xs hover:underline bg-foreground text-background border border-foreground p-1  w-full text-center"
          >
            The project
          </Link>
          <Link
            href="/store"
            className="uppercase text-xs hover:underline border border-foreground p-1 w-full text-center"
          >
            Back
          </Link>
        </div>
      </div>
    </div>
  );
}
