import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GKJ EH — AI Platform",
  description: "AI-powered assistant platform built on Claude",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
