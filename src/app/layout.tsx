import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
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
      <body className="h-full">
        <NuqsAdapter>
          <SessionProvider>
            <QueryProvider>
              <div className="h-full grid grid-rows-[auto_1fr_auto] bg-foreground">
                <Header />
                <main className="flex max-h-full flex-col h-full min-h-0 flex-1 overflow-y-auto">
                  {children}
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
