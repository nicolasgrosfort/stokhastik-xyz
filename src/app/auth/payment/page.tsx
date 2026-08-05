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
    <section className="bg-background text-foreground p-2 h-full w-full min-h-0">
      <div className="grid sm:grid-cols-2 sm:grid-rows-1 grid-rows-2 grid-cols-1 h-full w-full min-h-0">
        <div className="h-full w-full flex flex-col items-end justify-center p-2 gap-2 flex-1">
          <Model
            position={1}
            rotation={Math.PI * -0.2}
            model="/models/gamecube.glb"
            stopRotation
          />
        </div>

        <div className="h-full w-full flex flex-col items-start justify-center p-2 gap-2 flex-1 ">
          <H3 className="uppercase">Recharger mon compte</H3>
          <Payment />
        </div>
      </div>
    </section>
  );
}
