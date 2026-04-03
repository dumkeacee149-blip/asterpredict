import type { Metadata } from "next";
import { Teko, Chakra_Petch, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SplashCursor from "@/components/reactbits/SplashCursor";
import Noise from "@/components/reactbits/Noise";

const teko = Teko({ variable: "--font-display", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const chakraPetch = Chakra_Petch({ variable: "--font-heading", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const spaceGrotesk = Space_Grotesk({ variable: "--font-body", subsets: ["latin"] });
const spaceMono = Space_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Asterpredict — AI Market Predictions for Aster DEX",
  description: "AI-powered market predictions for Aster DEX and DeFi perps. Predict the next move with Kage.",
  openGraph: {
    title: "Asterpredict — AI Market Predictions for Aster DEX",
    description: "AI-powered market predictions for Aster DEX and DeFi perps.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Asterpredict",
    description: "AI-powered market predictions for Aster DEX and DeFi perps.",
    creator: "@Asterpredict",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${teko.variable} ${chakraPetch.variable} ${spaceGrotesk.variable} ${spaceMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SplashCursor />
        <Noise patternAlpha={10} patternRefreshInterval={4} />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
