import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Pixii AEO | AI Engine Optimization",
  description:
    "Diagnose your brand's visibility across the latent space of top LLMs.",
  openGraph: {
    title: "Pixii AEO | AI Engine Optimization",
    description:
      "Diagnose your brand's visibility across the latent space of top LLMs.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pixii AEO | AI Engine Optimization",
    description:
      "Diagnose your brand's visibility across the latent space of top LLMs.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F9F9F8",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
