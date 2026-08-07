import { H3 } from "@/components/h3";
import { Model } from "@/components/model";

export default function AboutPage() {
  return (
    <div className="text-foreground h-full w-full min-h-0">
      <div className="grid sm:grid-cols-[1fr_minmax(0,560px)] sm:grid-rows-1 grid-rows-[minmax(160px,1fr)_auto] grid-cols-1 h-full w-full min-h-0 gap-px">
        <div className="bg-background w-full h-full min-h-0">
          <Model
            position={2}
            rotation={Math.PI * 0.45}
            stopRotation={true}
            model="/models/banc-jardin-botanique.glb"
          />
        </div>

        <div className="w-full grid grid-rows-[auto_1fr] gap-px">
          <div className="h-full flex flex-col items-start justify-start p-4 gap-4 flex-1 bg-background">
            <H3 className="uppercase text-left">LA PLATEFORME</H3>
            <p className="font-mono text-sm text-left text-pretty">
              <i>STOKHASTIK</i> est une plateforme expérimentale qui documente
              mon séjour académique au Japon, réalisé dans le cadre de mon
              mémoire de Master en Media Design à la HEAD – Genève, entre Genève
              et Kyoto de juillet à septembre 2026.
            </p>
            <p className="font-mono text-sm text-left text-pretty">
              À travers multiple médiums, <i>STOKHASTIK</i> partage différentes
              facettes de cette recherche tout en proposant plusieurs façons de
              soutenir financièrement ce projet, dont un store. La plateforme
              évoluera progressivement tout au long de mon séjour, au rythme de
              mes découvertes et expérimentations.
            </p>
          </div>

          <div className="h-full flex flex-col items-start justify-start p-4 gap-4 flex-1 bg-background">
            <H3>LE STORE</H3>
            <p className="font-mono text-sm text-left text-pretty">
              Quelques informations importante à propos du store:
            </p>

            <ul className="font-mono text-left text-pretty list-decimal list-inside text-xs">
              <li>Chaque item est unique, disponible en un seul exemplaire.</li>
              <li>
                Les items seront distribués à mon retour (début octobre 2026)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
