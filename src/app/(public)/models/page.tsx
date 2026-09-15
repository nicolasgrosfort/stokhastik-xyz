import type { Metadata } from "next";
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

export default function ModelViewerPage() {
  return (
    <Suspense>
      <ModelViewer />
    </Suspense>
  );
}
