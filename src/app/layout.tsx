import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { MiniKitProvider } from "@/components/MiniKitProvider";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: "ChainOlympics - Compete. Verify. Win.",
  description: "Olympic-style games for verified humans with real crypto prizes",
  keywords: ["Olympics", "Blockchain", "World ID", "Competition", "Crypto"],
  manifest: "/manifest.json",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#000000",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MiniKitProvider>
          <div className={`min-h-screen bg-white ${playfair.variable}`}>
            <header className="bg-white border-b border-gray-200 shadow-sm">
              <div className="container mx-auto px-6 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl font-serif">C</span>
                    </div>
                    <div>
                      <h1 className="text-2xl font-playfair font-bold text-gray-900">ChainOlympics</h1>
                      <p className="text-sm text-gray-600 font-medium">Verified Competition Platform</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    World ID • ENS • Pyth
                  </div>
                </div>
              </div>
            </header>
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </MiniKitProvider>
      </body>
    </html>
  );
}
