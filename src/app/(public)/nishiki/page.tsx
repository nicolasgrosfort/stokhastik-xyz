import { PlyModel } from "@/components/common/ply-model";
import { Scene } from "@/components/common/scene";

export default async function NishikiPage() {
  const model = `/api/assets/models/${encodeURIComponent("2026-09-22-ambiance-globale-sanctuaire-nishiki-tenmangu.ply")}`;
  return (
    <div className="h-dvh w-screen min-h-0 fixed top-0 left-0 right-0 bottom-0 bg-background">
      <Scene>
        <PlyModel model={model} />
      </Scene>
    </div>
  );
}
