import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Sistem Pelaporan Insiden Keselamatan Pasien (IKP)",
  description: "Aplikasi Medical-grade untuk pelaporan, grading risiko, dan investigasi (RCA) Insiden Keselamatan Pasien.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
