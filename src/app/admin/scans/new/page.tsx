import { ScanForm } from "@/components/admin/scan-form";
import { H3 } from "@/components/common/h3";
import { listAvailableModelFiles, listScanTags } from "@/libs/scans";

export default async function NewScanPage() {
  const [tags, files] = await Promise.all([
    listScanTags(),
    listAvailableModelFiles(),
  ]);

  return (
    <section className="text-foreground bg-background h-full w-full min-h-0 flex flex-col items-center gap-4 p-4 overflow-y-auto">
      <H3 className="uppercase">Ajouter un scan</H3>
      <ScanForm tagSuggestions={tags} availableFiles={files} />
    </section>
  );
}
