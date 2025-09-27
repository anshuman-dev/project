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
          <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
            <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      🏆
                    </div>
                    <h1 className="text-xl font-bold text-white">ChainOlympics</h1>
                  </div>
                  <div className="text-sm text-gray-300">
                    Powered by World ID + ENS + Pyth
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
