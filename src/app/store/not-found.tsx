import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col bg-background items-center justify-center h-full font-mono">
      <h2>Oups!</h2>
      <p>Le produit que vous recherchez n&apos;est pas disponible.</p>
      <br />
      <Link href="/store" className="text-xs uppercase">
        Retour
      </Link>
    </div>
  );
}
