import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carpool — Share the route. Split the cost.",
  description: "A Michigan DevFest 2026 carpool prototype with fictional commuters, editable trip context and sample contribution totals.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
