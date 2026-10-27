import type { Metadata } from "next";
import { NextAppFrame } from "@/components/NextAppFrame";
import "@/index.css";

export const metadata: Metadata = {
  title: "DSpace dARK Importer",
  description: "Generate a read-only DSpace item-to-dARK CSV mapping."
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
