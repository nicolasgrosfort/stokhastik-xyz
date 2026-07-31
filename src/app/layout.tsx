import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { QueryProvider } from "@/components/query-provider";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

const mapleMono = localFont({
  src: [
    {
      path: "../fonts/maple-mono.ttf",
      style: "normal",
    },
    {
      path: "../fonts/maple-mono-italic.ttf",
      style: "italic",
    },
  ],
  variable: "--font-maple-mono",
});

export const metadata: Metadata = {
  title: "Stokhastik",
  description: "Espace de prorotypage, d'expérimentation et de partage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${mapleMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NuqsAdapter>
          <QueryProvider>
            <div className="min-h-full h-full grid grid-rows-[auto_minmax(0,1fr)_auto] bg-foreground flex-1">
              <Header />
              <main className="flex flex-col h-full min-h-0">{children}</main>
              <Footer />
            </div>
          </QueryProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
