'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMiniKit } from '@/components/MiniKitProvider';

export default function Home() {
  const { isReady } = useMiniKit();
  const [currentPrize, setCurrentPrize] = useState('$125.50');

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-20 py-12">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-playfair font-bold text-gray-900 mb-6 tracking-tight">
            Chain<span className="text-gray-600">Olympics</span>
          </h1>
          <div className="w-24 h-0.5 bg-gray-900 mx-auto mb-8"></div>
        </div>

        <p className="text-lg md:text-xl text-gray-700 mb-16 max-w-4xl mx-auto leading-relaxed font-medium">
          Skill-based competitions with verified human participation and real cryptocurrency rewards.
        </p>

        <div className="inline-flex items-center gap-4 bg-gray-50 border border-gray-300 rounded-lg px-8 py-5 shadow-sm">
          <div className="w-3 h-3 bg-green-600 rounded-full"></div>
          <span className="text-gray-700 text-lg font-medium">Current Prize Pool:</span>
          <span className="text-gray-900 font-bold text-xl">{currentPrize} WLD</span>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-20">
        <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 font-playfair">Human Verification</h3>
          <p className="text-gray-600 leading-relaxed">
            Zero-knowledge proof verification through World ID ensures only verified humans participate.
          </p>
        </div>

        <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 font-playfair">Athletic Identity</h3>
          <p className="text-gray-600 leading-relaxed">
            Secure your .athlete.eth subdomain for permanent cross-platform reputation.
          </p>
        </div>

        <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.08 2.94-.01 4.04.08 1.15.16 2.08.05 2.79-.12.75-.39 1.29-.73 1.61-.34.32-.77.51-1.28.59-.5.08-1.07.05-1.69-.08-.62-.13-1.29-.35-2.01-.65-.72-.3-1.49-.68-2.3-1.13-.81-.45-1.66-.98-2.55-1.59l1.4-1.4c.73.49 1.4.87 2.01 1.15.61.28 1.15.47 1.62.57.47.1.87.11 1.19.03.32-.08.56-.26.73-.54.17-.28.26-.66.31-1.14.05-.48.02-1.05-.08-1.7-.1-.65-.25-1.38-.45-2.18-.2-.8-.45-1.67-.75-2.61-.3-.94-.65-1.95-1.05-3.03l1.73-.67c.35.92.65 1.78.91 2.58.26.8.47 1.54.63 2.22.16.68.27 1.29.33 1.83.06.54.07 1.01.03 1.41z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 font-playfair">Real Rewards</h3>
          <p className="text-gray-600 leading-relaxed">
            Earn WLD tokens with dynamic pricing from Pyth Network real-time market data.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="space-y-8">
        {!isReady ? (
          <div className="bg-red-900/20 border border-red-700/50 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              ⚠️
            </div>
            <h3 className="text-xl font-semibold text-red-200 mb-2">World App Required</h3>
            <p className="text-red-300/80">Please open this app in World App to compete</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-900/20 border border-green-700/50 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                ✅
              </div>
              <h3 className="text-xl font-semibold text-green-200 mb-2">Ready to Compete</h3>
              <p className="text-green-300/80">World App detected - All systems ready</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/verify"
                className="bg-gray-900 hover:bg-gray-800 text-white px-10 py-3 rounded-lg font-medium text-lg transition-colors shadow-sm"
              >
                Start Competing
              </Link>
              <Link
                href="/leaderboard"
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 px-10 py-3 rounded-lg font-medium text-lg transition-colors shadow-sm"
              >
                View Leaderboard
              </Link>
            </div>
          </div>
        )}

        {/* Platform Navigation */}
        <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2 font-playfair">Platform Access</h3>
            <p className="text-gray-600">Navigate to all platform features</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Link
              href="/register"
              className="group bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 px-4 py-4 rounded-lg font-medium transition-all text-center shadow-sm"
            >
              <div className="text-xl mb-2">👛</div>
              <div className="text-sm">Register</div>
            </Link>
            <Link
              href="/game"
              className="group bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 px-4 py-4 rounded-lg font-medium transition-all text-center shadow-sm"
            >
              <div className="text-xl mb-2">🌋</div>
              <div className="text-sm">Play Game</div>
            </Link>
            <Link
              href="/leaderboard"
              className="group bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 px-4 py-4 rounded-lg font-medium transition-all text-center shadow-sm"
            >
              <div className="text-xl mb-2">🏆</div>
              <div className="text-sm">Leaderboard</div>
            </Link>
            <Link
              href="/verify"
              className="group bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 px-4 py-4 rounded-lg font-medium transition-all text-center shadow-sm"
            >
              <div className="text-xl mb-2">🌍</div>
              <div className="text-sm">Verify ID</div>
            </Link>
            <Link
              href="/test-qr"
              className="group bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 px-4 py-4 rounded-lg font-medium transition-all text-center shadow-sm"
            >
              <div className="text-xl mb-2">📱</div>
              <div className="text-sm">Test QR</div>
            </Link>
          </div>
        </div>
      </div>

      {/* Game Preview */}
      <div className="mt-20 bg-white rounded-lg p-10 border border-gray-200 shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-2xl">
              🌋
            </div>
            <h2 className="text-3xl font-semibold text-gray-900 font-playfair">Lava Platform Jumper</h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Master the art of precision platforming. Escape rising lava, navigate treacherous platforms,
            and climb your way to glory. The higher you rise, the greater your rewards.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl mx-auto mb-3">
              🏃‍♂️
            </div>
            <div className="text-gray-900 font-semibold mb-1">Platformer</div>
            <div className="text-gray-600 text-sm">Physics-based movement</div>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl mx-auto mb-3">
              🌋
            </div>
            <div className="text-gray-900 font-semibold mb-1">Rising Lava</div>
            <div className="text-gray-600 text-sm">Escalating difficulty</div>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl mx-auto mb-3">
              🎯
            </div>
            <div className="text-gray-900 font-semibold mb-1">Skill-Based</div>
            <div className="text-gray-600 text-sm">Pure merit competition</div>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl mx-auto mb-3">
              💰
            </div>
            <div className="text-gray-900 font-semibold mb-1">Real Prizes</div>
            <div className="text-gray-600 text-sm">WLD token rewards</div>
          </div>
        </div>
      </div>
    </div>
  );
}
