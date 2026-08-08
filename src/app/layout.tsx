import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { Model } from "@/components/model";
import { QueryProvider } from "@/providers/query-provider";
import { SessionProvider } from "@/providers/session-provider";
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
          <SessionProvider>
            <QueryProvider>
              <div className="min-h-full h-full grid grid-rows-[auto_minmax(0,1fr)_auto] bg-foreground flex-1">
                <Header />
                <main className="grid sm:grid-cols-[1fr_minmax(0,560px)] sm:grid-rows-1 grid-rows-[minmax(160px,1fr)_auto] grid-cols-1 h-full w-full min-h-0 gap-px">
                  <div className="bg-background w-full h-full min-h-0 sticky top-18 z-10 border-b border-px border-foreground sm:border-0">
                    <Model
                      position={1}
                      rotation={Math.PI * 0}
                      model="/models/chocolat.glb"
                    />
                  </div>
                  <div>{children}</div>
                </main>
                <Footer />
              </div>
            </QueryProvider>
          </SessionProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
