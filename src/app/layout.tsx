'use client'
import "./globals.css";
import SessionProviders from "../providers/SessionProviders";
import type { ReactNode } from "react";

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SessionProviders>{children}</SessionProviders>
      </body>
    </html>
  );
}


