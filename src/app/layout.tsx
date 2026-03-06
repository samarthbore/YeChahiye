import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "YeChahiye - Find What You Need, Locally",
  description: "Connect with local textile sellers in Amravati. Post your demand and receive bids from shopkeepers in Busyland and nearby markets.",
  keywords: ["textile", "local shopping", "Amravati", "Busyland", "fashion", "clothing"],
  openGraph: {
    title: "YeChahiye - Find What You Need, Locally",
    description: "Connect with local textile sellers in Amravati",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-white text-gray-900`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
