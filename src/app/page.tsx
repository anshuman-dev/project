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
      <div className="text-center mb-20">
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-light text-white mb-4 tracking-tight">
            Chain<span className="font-medium text-amber-400">Olympics</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto mb-8"></div>
        </div>

        <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
          Olympic-style competitions for verified humans. Compete with skill, earn with merit.
        </p>

        <div className="inline-flex items-center gap-3 bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl px-8 py-4">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-slate-300 text-lg">Current Prize Pool:</span>
          <span className="text-amber-400 font-semibold text-xl">{currentPrize} WLD</span>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-20">
        <div className="group bg-slate-900/30 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
            🌍
          </div>
          <h3 className="text-2xl font-semibold text-white mb-4">Proof of Human</h3>
          <p className="text-slate-400 leading-relaxed">
            Verify your identity with World ID zero-knowledge proofs. Only real humans compete.
          </p>
        </div>

        <div className="group bg-slate-900/30 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
            🏷️
          </div>
          <h3 className="text-2xl font-semibold text-white mb-4">Your Identity</h3>
          <p className="text-slate-400 leading-relaxed">
            Claim your .athlete.eth name for permanent on-chain reputation across platforms.
          </p>
        </div>

        <div className="group bg-slate-900/30 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-400 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
            💰
          </div>
          <h3 className="text-2xl font-semibold text-white mb-4">Real Prizes</h3>
          <p className="text-slate-400 leading-relaxed">
            Earn WLD tokens with real-time market pricing powered by Pyth Network oracles.
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
                className="group relative bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:shadow-blue-500/25"
              >
                <span className="relative z-10">Start Competing</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link
                href="/leaderboard"
                className="bg-slate-800/50 border border-slate-600/50 text-slate-200 px-10 py-4 rounded-2xl font-semibold text-lg hover:bg-slate-700/50 hover:border-slate-500/50 transition-all duration-300"
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
