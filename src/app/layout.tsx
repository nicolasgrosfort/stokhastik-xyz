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
  description: "A space made for prototyping and research",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${mapleMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NuqsAdapter>
          <QueryProvider>{children}</QueryProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
