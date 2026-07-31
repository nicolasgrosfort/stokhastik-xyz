import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stokhastik - Store",
  description: "Fragments of a trip to Japan for sale.",
};

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
