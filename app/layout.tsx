import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Party Hub — Play Together",
  description:
    "Bring your friends together for party games, poker, chess and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}