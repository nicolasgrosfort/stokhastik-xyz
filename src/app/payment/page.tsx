import Payment from "@/components/payment/payment";

export default function PaymentPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-16 text-white">
      <div className="mx-auto max-w-xl">
        <header className="mb-10">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
            Recharge
          </p>

          <h1 className="text-4xl font-semibold tracking-tight">
            Acheter des STKH
          </h1>

          <p className="mt-3 text-neutral-400">
            Choisis un pack, puis règle directement depuis cette page.
          </p>
        </header>

        <Payment />
      </div>
    </main>
  );
}
