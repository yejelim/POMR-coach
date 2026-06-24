import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POMR Coach",
  description: "Local-first POMR workspace for clerkship students.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "1024x1024" },
      { url: "/app-icon.png", type: "image/png", sizes: "1024x1024" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/app-icon.png", type: "image/png", sizes: "1024x1024" }],
  },
};

export const dynamic = "force-dynamic";

const themeScript = `
(() => {
  try {
    const stored = window.localStorage.getItem("pomr-coach-theme");
    const themes = ["mint-clinical", "warm-brown", "dark-slate"];
    const theme = themes.includes(stored || "") ? stored : "mint-clinical";
    document.documentElement.dataset.theme = theme;
    const sidebar = window.localStorage.getItem("pomr-coach-sidebar");
    document.documentElement.dataset.sidebar = sidebar === "collapsed" ? "collapsed" : "expanded";
  } catch {
    document.documentElement.dataset.theme = "mint-clinical";
    document.documentElement.dataset.sidebar = "expanded";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className="h-full antialiased"
      data-theme="mint-clinical"
      data-sidebar="expanded"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
