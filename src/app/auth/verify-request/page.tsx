import { H1 } from "@/components/h1";

export default function VerifyRequestPage() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 h-full p-4 text-center bg-background">
      <H1>Vérifie tes emails</H1>
      <p className="font-mono text-sm">
        Un lien de connexion vient de t&apos;être envoyé.
      </p>
    </section>
  );
}
