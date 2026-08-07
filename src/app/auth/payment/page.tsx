import { H3 } from "@/components/h3";
import { Model } from "@/components/model";
import Payment from "@/components/payment/payment";
import { authOptions } from "@/libs/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function PaymentPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=/payment");
  }

  return (
    <section className="text-foreground h-full w-full min-h-0">
      <div className="grid sm:grid-cols-2 sm:grid-rows-1 grid-rows-[minmax(160px,1fr)_auto] grid-cols-1 h-full w-full min-h-0 gap-px">
        <div className="bg-background w-full h-full min-h-0">
          <Model
            position={2}
            rotation={Math.PI * -0.5}
            model="/models/saisen-bako.glb"
            stopRotation
          />
        </div>

        <div className="bg-background w-full flex min-h-0 items-center justify-center">
          <div className=" h-full sm:max-w-120 flex flex-col items-start justify-center p-4 gap-4 flex-1">
            <H3 className="uppercase">Recharger mon compte</H3>
            <Payment />
          </div>
        </div>
      </div>
    </section>
  );
}
