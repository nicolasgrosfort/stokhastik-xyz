import { H3 } from "@/components/h3";
import { Model } from "@/components/model";

export default function AboutPage() {
  return (
    <div className="text-foreground h-full w-full min-h-0">
      <div className="grid sm:grid-cols-2 sm:grid-rows-1 grid-rows-[minmax(160px,1fr)_auto] grid-cols-1 h-full w-full min-h-0 gap-px">
        <div className="bg-background w-full h-full min-h-0">
          <Model
            position={2.5}
            rotation={Math.PI * 0.5}
            stopRotation={true}
            model="/models/banc-jardin-botanique.glb"
          />
        </div>
        <div className="bg-background w-full flex items-center justify-center">
          <div className="h-full sm:max-w-120 flex flex-col items-start justify-center p-4 gap-2 flex-1">
            <H3 className="uppercase text-left">À PROPOS</H3>
            <p className="font-mono text-sm text-left text-pretty">
              Stokhastik Store est une plateforme expérimentale qui documente
              mon séjour académique au Japon, dans le cadre de mon mémoire de
              Master en Media Design à la HEAD – Genève, réalisé entre Genève et
              Kyoto de juillet à septembre 2026.
            </p>
            <p className="font-mono text-sm text-left text-pretty">
              À travers multiple médiums, elle partage différentes facettes de
              cette recherche tout en proposant plusieurs façons de soutenir
              financièrement ce projet, dont une boutique. La plateforme
              évoluera progressivement tout au long de mon séjour, au rythme de
              mes découvertes et expérimentations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
