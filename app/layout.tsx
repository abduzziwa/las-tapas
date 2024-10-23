import type { Metadata } from "next";
import "./globals.css";
import { Comfortaa } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Las Tapas",
  description:
    "Welcome to Las Tapas! Explore our delicious menu, place your order for dine-in, takeaway, or delivery, and track your order in real-time. Enjoy a seamless dining experience with us!",
};

const confortaa = Comfortaa({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Toaster />
      <body className={confortaa.className}>{children}</body>
    </html>
  );
}
