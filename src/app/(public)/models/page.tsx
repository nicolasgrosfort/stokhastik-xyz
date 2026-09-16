import { authOptions } from "@/libs/auth";
import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { Suspense } from "react";
import { ModelViewer } from "./model-viewer";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ pageName?: string }>;
}): Promise<Metadata> {
  const { pageName } = await searchParams;

  return pageName ? { title: pageName } : {};
}

export default async function ModelViewerPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user.role === "ADMIN";

  return (
    <Suspense>
      <ModelViewer isAdmin={isAdmin} />
    </Suspense>
  );
}
