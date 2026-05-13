import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POMR Coach",
  description: "Write your own POMR first and reflect with AI.",
  icons: {
    icon: "/app-icon.png",
    apple: "/app-icon.png",
  },
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
