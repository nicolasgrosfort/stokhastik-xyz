import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground p-2 h-full">
      <p>About</p>
      <Link href="/store" className="">
        Retour
      </Link>
    </div>
  );
}
