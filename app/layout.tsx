import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ski Wax Guide",
  description:
    "Get ski wax recommendations based on current temperature and conditions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-screen antialiased overscroll-none">
        {children}
      </body>
    </html>
  );
}
