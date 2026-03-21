import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GKJ EH",
  description: "A Next.js dashboard application",
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
