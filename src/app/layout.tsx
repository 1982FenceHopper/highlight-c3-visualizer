import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";

import NextThemesProvider from "@/providers/NextThemesProvider";
import { Navbar } from "@/components/Home/Navbar";
import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Highlight C3",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <NextThemesProvider
          enableSystem
          enableColorScheme
          defaultTheme="dark"
          attribute="class"
        >
          <Navbar />
          <main>{children}</main>
          <Toaster />
        </NextThemesProvider>
      </body>
    </html>
  );
}
