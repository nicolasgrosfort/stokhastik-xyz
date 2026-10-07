import { ScanThumbnailTool } from "@/components/admin/scan-thumbnail-tool";
import { H3 } from "@/components/common/h3";
import { getScanForList } from "@/libs/scans";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ScanThumbnailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scan = await getScanForList(id);

  if (!scan) {
    notFound();
  }

  return (
    <section className="text-foreground bg-background h-full w-full min-h-0 flex flex-col items-start gap-4 p-4 overflow-y-auto">
      <div className="w-full flex items-center justify-between gap-4">
        <H3 className="uppercase">Miniature · {scan.name}</H3>
        <Link
          href="/admin/scans"
          className="font-mono text-xs uppercase underline whitespace-nowrap"
        >
          ← Scans
        </Link>
      </div>
      <ScanThumbnailTool
        scanId={scan.id}
        file={scan.file}
        name={scan.name}
        thumbnail={scan.thumbnail}
      />
    </section>
  );
}
