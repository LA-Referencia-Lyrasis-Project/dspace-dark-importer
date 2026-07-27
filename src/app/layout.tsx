import type { Metadata } from "next";
import { NextAppFrame } from "@/components/NextAppFrame";
import "@/index.css";

export const metadata: Metadata = {
  title: "DSpace dARK ID Importer",
  description: "Bulk update DSpace item metadata from CSV files."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextAppFrame>{children}</NextAppFrame>
      </body>
    </html>
  );
}
