import { H3 } from "@/components/h3";
import { Model } from "@/components/model";
import Link from "next/link";

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

        <div className="w-full grid grid-rows-[auto_auto_1fr] gap-px max-h-full overflow-y-auto">
          <div className="h-full flex flex-col items-start justify-start p-4 gap-4 flex-1 bg-background">
            <H3 className="uppercase text-left">LA PLATEFORME</H3>
            <p className="font-mono text-sm text-left text-pretty">
              <i>STOKHASTIK</i> est une plateforme expérimentale qui accompagne
              mon mémoire de Master en Media Design à la HEAD – Genève et
              documente mon séjour de recherche à Kyoto, de juillet à septembre
              2026. Elle évoluera progressivement au fil de mes découvertes,
              rencontres et expérimentations, à travers différents médiums et
              formes de participation.
            </p>
          </div>

          <div className="h-full flex flex-col items-start justify-start p-4 gap-4 flex-1 bg-background">
            <H3>LE STORE</H3>
            <p className="font-mono text-sm text-left text-pretty">
              Le store est une manière de partager des fragments de mon séjour -
              objets, trouvailles et expériences gustatives - tout en
              contribuant au financement de cette recherche. Chaque item nourrit
              également le projet, notamment à travers sa documentation, sa
              numérisation et son exploration technique. Les objets sont
              uniques, disponibles en un seul exemplaire, et seront distribués à
              mon retour début octobre 2026.
            </p>
          </div>

          <div className="h-full flex flex-col items-start justify-start p-4 gap-4 flex-1 bg-background">
            <H3>ME CONTACTER</H3>
            <p className="font-mono text-sm text-left text-pretty">
              Pour toute question ou en cas de problème, tu peux me contacter à
              l'adresse suivante{" "}
              <Link href="mailto:hey@tekh.studio" className="underline">
                hey[@]tekh.studio
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
