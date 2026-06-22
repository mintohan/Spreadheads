import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SpreadHeads 🦈 — Sports Pick'em",
  description: "Social sports pick'em. Make your picks, join communities, compete in leagues.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-[#060d18] text-white`}>
        {children}
      </body>
    </html>
  );
}
