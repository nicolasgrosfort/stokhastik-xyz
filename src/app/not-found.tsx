import { H3 } from "@/components/h3";
import { Model } from "@/components/model";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-foreground h-full w-full min-h-0">
      <div className="grid sm:grid-cols-[1fr_minmax(0,560px)] sm:grid-rows-1 grid-rows-[minmax(160px,1fr)_auto] grid-cols-1 h-full w-full min-h-0 gap-px">
        <div className="bg-background w-full h-full min-h-0">
          <Model
            position={6}
            rotation={Math.PI * 0.4}
            stopRotation={true}
            model="/models/torii-shimogamo-shina.glb"
          />
        </div>

        <div className="w-full grid grid-rows-[auto_1fr] gap-px">
          <div className="h-full flex flex-col items-start justify-start p-4 gap-4 flex-1 bg-background">
            <H3 className="uppercase text-left">Sumimasen</H3>
            <p className="font-mono text-sm text-left text-pretty">
              La page que vous recherchez n'existe pas...
            </p>
          </div>
          <div className="h-full flex flex-col items-start justify-start p-4 gap-4 flex-1 bg-background">
            <p className="text-xs">
              Aller sur à la{" "}
              <Link href="/" className="underline">
                page d'accueil
              </Link>
              , ou faire un tour sur le{" "}
              <Link href="/store" className="underline">
                store
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
