'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMiniKit } from '@/components/MiniKitProvider';

export default function Home() {
  const { isReady } = useMiniKit();
  const [currentPrize, setCurrentPrize] = useState('$125.50');

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-24 py-16">
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Chain<span className="text-blue-400">Olympics</span>
          </h1>
          <div className="w-16 h-1 bg-blue-500 mx-auto mb-8"></div>
        </div>

        <p className="text-xl md:text-2xl text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed">
          Skill-based competitions with verified human participation and real cryptocurrency rewards.
        </p>

        <div className="inline-flex items-center gap-4 bg-gray-900 border border-gray-700 rounded-xl px-8 py-5">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span className="text-gray-200 text-lg font-medium">Current Prize Pool:</span>
          <span className="text-blue-400 font-bold text-xl">{currentPrize} WLD</span>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-24">
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition-colors">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-4">Human Verification</h3>
          <p className="text-gray-400 leading-relaxed">
            Zero-knowledge proof verification through World ID ensures only verified humans participate.
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition-colors">
          <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-4">Athletic Identity</h3>
          <p className="text-gray-400 leading-relaxed">
            Secure your .athlete.eth subdomain for permanent cross-platform reputation.
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition-colors">
          <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mb-6">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.08 2.94-.01 4.04.08 1.15.16 2.08.05 2.79-.12.75-.39 1.29-.73 1.61-.34.32-.77.51-1.28.59-.5.08-1.07.05-1.69-.08-.62-.13-1.29-.35-2.01-.65-.72-.3-1.49-.68-2.3-1.13-.81-.45-1.66-.98-2.55-1.59l1.4-1.4c.73.49 1.4.87 2.01 1.15.61.28 1.15.47 1.62.57.47.1.87.11 1.19.03.32-.08.56-.26.73-.54.17-.28.26-.66.31-1.14.05-.48.02-1.05-.08-1.7-.1-.65-.25-1.38-.45-2.18-.2-.8-.45-1.67-.75-2.61-.3-.94-.65-1.95-1.05-3.03l1.73-.67c.35.92.65 1.78.91 2.58.26.8.47 1.54.63 2.22.16.68.27 1.29.33 1.83.06.54.07 1.01.03 1.41z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-4">Real Rewards</h3>
          <p className="text-gray-400 leading-relaxed">
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

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/verify"
                className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-xl font-semibold text-lg transition-colors"
              >
                Start Competing
              </Link>
              <Link
                href="/leaderboard"
                className="bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-200 px-12 py-4 rounded-xl font-semibold text-lg transition-colors"
              >
                View Leaderboard
              </Link>
            </div>
          </div>
        )}

        {/* Testing Navigation */}
        <div className="bg-slate-900/30 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/30">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-semibold text-white mb-2">Platform Access</h3>
            <p className="text-slate-400">Quick navigation to all platform features</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/register"
              className="group bg-slate-800/50 hover:bg-blue-900/30 border border-slate-600/50 hover:border-blue-500/50 text-slate-200 hover:text-blue-200 px-6 py-4 rounded-2xl font-medium transition-all duration-300 text-center"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">👛</div>
              <div>Register</div>
            </Link>
            <Link
              href="/game"
              className="group bg-slate-800/50 hover:bg-orange-900/30 border border-slate-600/50 hover:border-orange-500/50 text-slate-200 hover:text-orange-200 px-6 py-4 rounded-2xl font-medium transition-all duration-300 text-center"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">🌋</div>
              <div>Play Game</div>
            </Link>
            <Link
              href="/leaderboard"
              className="group bg-slate-800/50 hover:bg-amber-900/30 border border-slate-600/50 hover:border-amber-500/50 text-slate-200 hover:text-amber-200 px-6 py-4 rounded-2xl font-medium transition-all duration-300 text-center"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">🏆</div>
              <div>Leaderboard</div>
            </Link>
            <Link
              href="/verify"
              className="group bg-slate-800/50 hover:bg-purple-900/30 border border-slate-600/50 hover:border-purple-500/50 text-slate-200 hover:text-purple-200 px-6 py-4 rounded-2xl font-medium transition-all duration-300 text-center"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">🌍</div>
              <div>Verify ID</div>
            </Link>
          </div>
        </div>
      </div>

      {/* Game Preview */}
      <div className="mt-20 bg-slate-900/30 backdrop-blur-sm rounded-3xl p-10 border border-slate-700/30">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-2xl">
              🌋
            </div>
            <h2 className="text-3xl font-semibold text-white">Lava Platform Jumper</h2>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Master the art of precision platforming. Escape rising lava, navigate treacherous platforms,
            and climb your way to glory. The higher you rise, the greater your rewards.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
              🏃‍♂️
            </div>
            <div className="text-orange-400 font-semibold mb-1">Platformer</div>
            <div className="text-slate-500 text-sm">Physics-based movement</div>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
              🌋
            </div>
            <div className="text-red-400 font-semibold mb-1">Rising Lava</div>
            <div className="text-slate-500 text-sm">Escalating difficulty</div>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
              🎯
            </div>
            <div className="text-yellow-400 font-semibold mb-1">Skill-Based</div>
            <div className="text-slate-500 text-sm">Pure merit competition</div>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
              💰
            </div>
            <div className="text-green-400 font-semibold mb-1">Real Prizes</div>
            <div className="text-slate-500 text-sm">WLD token rewards</div>
          </div>
        </div>
      </div>
    </div>
  );
}
