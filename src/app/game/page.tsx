'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PythPriceManager } from '@/lib/pyth';
import LavaPlatformGame from '@/components/LavaPlatformGame';

export default function GamePage() {
  const router = useRouter();
  const [athleteData, setAthleteData] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [wldPrice, setWldPrice] = useState(2.50);
  const [currentPrize, setCurrentPrize] = useState('');
  const [gameResult, setGameResult] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [showGame, setShowGame] = useState(false);
  const pythManager = PythPriceManager.getInstance();

  // Load athlete data on mount
  useEffect(() => {
    const stored = localStorage.getItem('chainolympics_athlete');
    if (!stored) {
      router.push('/verify');
      return;
    }
    setAthleteData(JSON.parse(stored));
  }, [router]);

  // Update WLD price periodically
  useEffect(() => {
    const updatePrice = async () => {
      const priceData = await pythManager.fetchWLDPrice();
      setWldPrice(priceData.price);

      // Update current prize display for max score
      const maxScore = 50; // High score for platform jumping
      const prizeCalc = pythManager.calculatePrizeAmount(maxScore, maxScore);
      setCurrentPrize(pythManager.formatPriceDisplay(prizeCalc.wldAmount));
    };

    updatePrice();
    const interval = setInterval(updatePrice, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [pythManager]);

  const handleGameEnd = async (score: number, level: number) => {
    // Calculate prize based on score and level
    const maxScore = 50; // Reasonable max for platform jumping
    const adjustedScore = Math.min(score, maxScore); // Cap the score
    const prizeCalc = pythManager.calculatePrizeAmount(adjustedScore, maxScore);

    // Add level bonus
    const levelBonus = (level - 1) * 0.1; // 10% bonus per level above 1
    const finalPrize = {
      ...prizeCalc,
      wldAmount: prizeCalc.wldAmount * (1 + levelBonus),
      usdAmount: prizeCalc.usdAmount * (1 + levelBonus),
    };

    const result = {
      score,
      level,
      maxScore,
      prize: finalPrize,
      timestamp: new Date().toISOString(),
    };

    setGameResult(result);

    // Update athlete stats in localStorage
    if (athleteData) {
      const updatedAthlete = {
        ...athleteData,
        gamesPlayed: (athleteData.gamesPlayed || 0) + 1,
        bestScore: Math.max(athleteData.bestScore || 0, score),
        totalWinnings: (parseFloat(athleteData.totalWinnings || '0') + finalPrize.wldAmount).toFixed(4),
        lastLevel: level,
      };
      localStorage.setItem('chainolympics_athlete', JSON.stringify(updatedAthlete));
      setAthleteData(updatedAthlete);
    }

    setShowGame(false);
  };

  const startNewGame = () => {
    setGameResult(null);
    setShowGame(true);
  };

  if (!athleteData) {
    return (
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto"></div>
        <p className="text-white mt-4">Loading athlete data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">🌋 Lava Platform Jumper</h1>
        <p className="text-gray-300">
          Welcome back, <span className="text-yellow-400 font-bold">{athleteData.ensName}</span>
        </p>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{athleteData.gamesPlayed || 0}</div>
          <div className="text-gray-300 text-sm">Games Played</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{athleteData.bestScore || 0}</div>
          <div className="text-gray-300 text-sm">Best Score</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">${wldPrice.toFixed(3)}</div>
          <div className="text-gray-300 text-sm">WLD Price</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{athleteData.totalWinnings || '0.0000'}</div>
          <div className="text-gray-300 text-sm">Total WLD Won</div>
        </div>
      </div>

      {/* Game Area */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 mb-8">
        {!showGame && !gameResult ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Escape the Lava?</h2>
            <div className="mb-6">
              <div className="text-6xl mb-4">🏃‍♂️🌋</div>
              <p className="text-gray-300 mb-4">
                Jump on platforms to escape the rising lava! Higher you climb, more you earn!
              </p>
              <div className="bg-gradient-to-r from-orange-400 to-red-500 text-black px-6 py-3 rounded-full inline-block font-bold text-lg mb-4">
                Max Prize: {currentPrize}
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300 mb-6">
                <div>
                  <div className="text-yellow-400 font-bold">🟫 Normal</div>
                  <div>Regular platforms</div>
                </div>
                <div>
                  <div className="text-green-400 font-bold">🟢 Bonus</div>
                  <div>+5 points, higher jump</div>
                </div>
                <div>
                  <div className="text-red-400 font-bold">🔴 Danger</div>
                  <div>-2 points penalty</div>
                </div>
              </div>
            </div>
            <button
              onClick={startNewGame}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
            >
              🌋 Start Climbing!
            </button>
          </div>
        ) : showGame ? (
          <div className="text-center">
            <LavaPlatformGame onGameEnd={handleGameEnd} />
          </div>
        ) : (
          gameResult && (
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold text-white mb-4">🏆 Game Complete!</h2>

              <div className="bg-white/5 rounded-lg p-6 mb-6 max-w-md mx-auto">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Final Score:</span>
                    <span className="text-white font-bold">{gameResult.score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Level Reached:</span>
                    <span className="text-orange-400 font-bold">Level {gameResult.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Performance:</span>
                    <span className="text-yellow-400 font-bold">
                      {((gameResult.score / gameResult.maxScore) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Multiplier:</span>
                    <span className="text-yellow-400 font-bold">{gameResult.prize.multiplier}x</span>
                  </div>
                  <hr className="border-gray-600" />
                  <div className="flex justify-between">
                    <span className="text-gray-300">Prize Won:</span>
                    <span className="text-green-400 font-bold">
                      {gameResult.prize.wldAmount.toFixed(4)} WLD
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    ≈ ${gameResult.prize.usdAmount.toFixed(2)} USD
                  </div>
                  {gameResult.level > 1 && (
                    <div className="text-sm text-orange-300">
                      🔥 Level {gameResult.level} Bonus: +{((gameResult.level - 1) * 10)}%
                    </div>
                  )}
                </div>
              </div>

              <div className="space-x-4">
                <button
                  onClick={startNewGame}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-bold transition-all"
                >
                  🔄 Play Again
                </button>
                <button
                  onClick={() => router.push('/leaderboard')}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-bold transition-all border border-white/20"
                >
                  🏆 View Leaderboard
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Game Instructions */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-3">🎮 How to Play</h3>
        <div className="grid md:grid-cols-2 gap-4 text-gray-300 text-sm">
          <div>
            <p className="mb-2"><strong>🎯 Objective:</strong> Climb as high as possible to escape the rising lava</p>
            <p className="mb-2"><strong>⌨️ Controls:</strong> Arrow keys or WASD to move, Space/Up to jump</p>
            <p className="mb-2"><strong>📱 Mobile:</strong> Touch to move, tap to jump</p>
          </div>
          <div>
            <p className="mb-2"><strong>🔥 Lava:</strong> Rises faster each level - don&apos;t get caught!</p>
            <p className="mb-2"><strong>💰 Scoring:</strong> Height climbed + platform bonuses</p>
            <p className="mb-2"><strong>🏆 Prizes:</strong> Dynamic WLD rewards via Pyth price feeds</p>
          </div>
        </div>
      </div>
    </div>
  );
}