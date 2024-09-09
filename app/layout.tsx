import type { Metadata } from "next";
import "./globals.css";
import { Comfortaa } from "@next/font/google";

export const metadata: Metadata = {
  title: "Las Tapas",
  description: "",
};

const confortaa = Comfortaa({
    subsets: ["latin"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body className={ confortaa.className }>{children}</body>
    </html>
  );
}
