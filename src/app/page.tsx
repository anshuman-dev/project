'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMiniKit } from '@/components/MiniKitProvider';

export default function Home() {
  const { isReady } = useMiniKit();
  const [currentPrize, setCurrentPrize] = useState('$125.50');

  return (
    <div className="max-w-4xl mx-auto text-center">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Chain<span className="text-yellow-400">Olympics</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8">
          Olympic-style competitions for verified humans
        </p>
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-full inline-block font-bold text-lg">
          Current Prize Pool: {currentPrize} WLD
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="text-4xl mb-4">🌍</div>
          <h3 className="text-xl font-bold text-white mb-2">Proof of Human</h3>
          <p className="text-gray-300">
            Verify you&apos;re a real person with World ID. No bots allowed!
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="text-4xl mb-4">🏷️</div>
          <h3 className="text-xl font-bold text-white mb-2">Your Identity</h3>
          <p className="text-gray-300">
            Register your athlete name with ENS for lasting reputation
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-xl font-bold text-white mb-2">Real Prizes</h3>
          <p className="text-gray-300">
            Win WLD tokens with dynamic pricing powered by Pyth
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="space-y-6">
        {!isReady ? (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-200">
            ⚠️ Please open this app in World App to compete
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-green-400 font-medium">
              ✅ World App detected - Ready to compete!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/verify"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                Start Competing
              </Link>
              <Link
                href="/leaderboard"
                className="bg-white/10 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/20 transition-all border border-white/20"
              >
                View Leaderboard
              </Link>
            </div>
          </div>
        )}

        {/* Testing Navigation */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">🧪 Test the Platform</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/register"
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500 text-blue-200 px-4 py-3 rounded-lg text-sm font-medium transition-all text-center"
            >
              👛 Register Athlete
            </Link>
            <Link
              href="/game"
              className="bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500 text-orange-200 px-4 py-3 rounded-lg text-sm font-medium transition-all text-center"
            >
              🌋 Play Game
            </Link>
            <Link
              href="/leaderboard"
              className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500 text-yellow-200 px-4 py-3 rounded-lg text-sm font-medium transition-all text-center"
            >
              🏆 Leaderboard
            </Link>
            <Link
              href="/verify"
              className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500 text-purple-200 px-4 py-3 rounded-lg text-sm font-medium transition-all text-center"
            >
              🌍 World ID
            </Link>
          </div>
          <p className="text-gray-400 text-sm mt-3 text-center">
            Quick access to all platform features for testing
          </p>
        </div>
      </div>

      {/* Game Preview */}
      <div className="mt-16 bg-white/5 rounded-xl p-8 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-4">🌋 Featured Game: Lava Platform Jumper</h2>
        <p className="text-gray-300 mb-6">
          Escape the rising lava by jumping on platforms! A thrilling skill-based adventure
          where the higher you climb, the more you earn. Beat the lava, beat the competition!
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-orange-400 font-bold">🏃‍♂️ Platformer</div>
            <div className="text-gray-400">Stickman Adventure</div>
          </div>
          <div>
            <div className="text-red-400 font-bold">🌋 Rising Lava</div>
            <div className="text-gray-400">Increasing Speed</div>
          </div>
          <div>
            <div className="text-yellow-400 font-bold">🎯 Skill-Based</div>
            <div className="text-gray-400">No Gambling</div>
          </div>
          <div>
            <div className="text-green-400 font-bold">💰 Real Prizes</div>
            <div className="text-gray-400">Level Bonuses</div>
          </div>
        </div>
      </div>
    </div>
  );
}
