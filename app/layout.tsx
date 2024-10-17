import type { Metadata } from "next";
import "./globals.css";
import { Comfortaa } from "next/font/google";

export const metadata: Metadata = {
  title: "Las Tapas",
  description:
    "Welcome to Las Tapas! Explore our delicious menu, place your order for dine-in, takeaway, or delivery, and track your order in real-time. Enjoy a seamless dining experience with us!",
};

const comfortaa = Comfortaa({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={comfortaa.className}>{children}</body>
    </html>
  );
}
