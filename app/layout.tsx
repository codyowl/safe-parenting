import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Little Steps | A little support for parents",
  description: "Brief, practical parenting support in English and Urdu. A take-home prototype.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
