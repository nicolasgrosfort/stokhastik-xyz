import { H3 } from "@/components/h3";

export default function AdminPage() {
  return (
    <section className="text-foreground bg-background h-full w-full min-h-0 flex flex-col items-center justify-center gap-4 p-4">
      <H3 className="uppercase">Admin</H3>
      <p className="font-mono text-xs uppercase">
        Espace d&apos;administration.
      </p>
    </section>
  );
}
