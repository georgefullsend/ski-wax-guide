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
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
