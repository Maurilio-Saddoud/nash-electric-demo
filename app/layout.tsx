import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SessionWatcher } from "@/components/SessionWatcher";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nash Electric Inventory Demo",
  description: "QR-based van inventory demo app for Nash Electric"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionWatcher />
        {children}
      </body>
    </html>
  );
}
