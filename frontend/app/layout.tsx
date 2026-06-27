import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "@copilotkit/react-ui/styles.css";
import "./globals.css";

import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "TripBuddy — AI Travel Assistant",
  description:
    "Plan your next trip with an intelligent AI assistant. Get weather, find flights, and book travel — all in one beautiful interface.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
