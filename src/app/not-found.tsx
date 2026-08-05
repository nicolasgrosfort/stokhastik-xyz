import { H3 } from "@/components/h3";
import { Model } from "@/components/model";

export default function NotFound() {
  return (
    <div className="bg-background text-foreground p-2 h-full w-full min-h-0">
      <div className="grid grid-rows-[auto_1fr_auto] h-full w-full min-h-0">
        <div className="h-full w-full flex flex-col items-center p-4 py-8 gap-2 flex-1 min-h-0 ">
          <H3>Sumimasen</H3>
        </div>
        <div className="w-full h-full min-h-0">
          <Model
            position={5}
            rotation={0}
            stopRotation={true}
            model="/models/torii-shimogamo-shina.glb"
          />
        </div>
        <div className="h-full w-full text-sm flex flex-col items-center p-4 py-8 gap-2 flex-1 min-h-0 ">
          <p>La page que vous recherchez n'existe pas...</p>
        </div>
      </div>
    </div>
  );
}
