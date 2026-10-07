import { ScanForm } from "@/components/admin/scan-form";
import { ScanThumbnailTool } from "@/components/admin/scan-thumbnail-tool";
import { H3 } from "@/components/common/h3";
import { getScanForList, listScanTags } from "@/libs/scans";
import { notFound } from "next/navigation";

export default async function EditScanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [scan, tags] = await Promise.all([getScanForList(id), listScanTags()]);

  if (!scan) {
    notFound();
  }

  return (
    <section className="text-foreground bg-background h-full w-full min-h-0 flex flex-col items-center gap-4 p-4 overflow-y-auto">
      <H3 className="uppercase">Modifier le scan</H3>
      <div className="w-full max-w-2xl">
        <ScanThumbnailTool
          scanId={scan.id}
          file={scan.file}
          name={scan.name}
          thumbnail={scan.thumbnail}
        />
      </div>
      <ScanForm scan={scan} tagSuggestions={tags} />
    </section>
  );
}
