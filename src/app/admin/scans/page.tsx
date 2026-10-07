import { AdminScanList } from "@/components/admin/scan-list";
import { H3 } from "@/components/common/h3";
import { listScans } from "@/libs/scans";
import Link from "next/link";

export default async function AdminScansPage() {
  const scans = await listScans();

  return (
    <section className="text-foreground bg-background h-full w-full min-h-0 flex flex-col items-start gap-4 p-4 overflow-y-auto">
      <div className="w-full flex items-center justify-between">
        <H3 className="uppercase">Scans</H3>
        <Link href="/admin" className="font-mono text-xs uppercase underline">
          ← Admin
        </Link>
      </div>
      <AdminScanList scans={scans} />
    </section>
  );
}
