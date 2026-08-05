import { H2 } from "@/components/h2";
import { Model } from "@/components/model";

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground p-2 h-full w-full min-h-0">
      <div className="grid sm:grid-cols-2 sm:grid-rows-1 grid-rows-[minmax(0,1fr)_auto] grid-cols-1 h-full w-full min-h-0">
        <div className="w-full h-full min-h-0">
          <Model
            position={4}
            rotation={Math.PI * 0.1}
            model="/models/banc-jardin-botanique.glb"
            stopRotation
          />
        </div>
        <div className="h-full w-full flex flex-col items-start justify-center p-2 gap-2 flex-1">
          <H2 className="uppercase text-left">À PROPOS</H2>
          <p className="font-mono text-sm text-left ">
            Stokhastik Store est une plateforme expérimentale qui documente mon
            séjour académique au Japon, dans le cadre de mon mémoire de Master
            en Media Design à la HEAD – Genève, réalisé entre Genève et Kyoto de
            juillet à septembre 2026.
          </p>

          <p className="font-mono text-sm text-left ">
            À travers multiple médiums, elle partage différentes facettes de
            cette recherche tout en proposant plusieurs façons de soutenir
            financièrement ce projet, dont une boutique. La plateforme évoluera
            progressivement tout au long de mon séjour, au rythme de mes
            découvertes et expérimentations.
          </p>
        </div>
      </div>
    </div>
  );
}
