import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MiniKitProvider } from "@/components/MiniKitProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChainOlympics - Compete. Verify. Win.",
  description: "Olympic-style games for verified humans with real crypto prizes",
  keywords: ["Olympics", "Blockchain", "World ID", "Competition", "Crypto"],
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
          <div className="min-h-screen bg-gray-950">
            <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
              <div className="container mx-auto px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">C</span>
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold text-white">ChainOlympics</h1>
                      <p className="text-xs text-gray-400">Verified Competition Platform</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 font-medium">
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
