'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PythPriceManager } from '@/lib/pyth';
import { blockchainManager } from '@/lib/blockchain';
import LavaPlatformGame from '@/components/LavaPlatformGame';

export default function GamePage() {
  const router = useRouter();
  const [athleteData, setAthleteData] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [wldPrice, setWldPrice] = useState(2.50);
  const [currentPrize, setCurrentPrize] = useState('');
  const [gameResult, setGameResult] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [showGame, setShowGame] = useState(false);
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);
  const [blockchainTx, setBlockchainTx] = useState<string | null>(null);
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
    setIsSubmittingResult(true);
    setBlockchainTx(null);

    try {
      // Submit game result to blockchain
      const blockchainResult = await blockchainManager.submitGameResult(
        score,
        level,
        'lava-platform-jumper'
      );

      if (blockchainResult.success && blockchainResult.txHash) {
        setBlockchainTx(blockchainResult.txHash);

        // Calculate prize based on blockchain response
        const maxScore = 50;
        const adjustedScore = Math.min(score, maxScore);
        const prizeCalc = pythManager.calculatePrizeAmount(adjustedScore, maxScore);

        // Use blockchain prize amount if available
        const blockchainPrize = blockchainResult.prizeAmount
          ? parseFloat(blockchainResult.prizeAmount)
          : prizeCalc.wldAmount;

        const levelBonus = (level - 1) * 0.1;
        const finalPrize = {
          ...prizeCalc,
          wldAmount: blockchainPrize * (1 + levelBonus),
          usdAmount: blockchainPrize * (1 + levelBonus) * wldPrice,
        };

        const result = {
          score,
          level,
          maxScore,
          prize: finalPrize,
          timestamp: new Date().toISOString(),
          txHash: blockchainResult.txHash,
          blockchainVerified: true,
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
            lastTxHash: blockchainResult.txHash,
          };
          localStorage.setItem('chainolympics_athlete', JSON.stringify(updatedAthlete));
          setAthleteData(updatedAthlete);
        }
      } else {
        throw new Error(blockchainResult.error || 'Blockchain submission failed');
      }
    } catch (error) {
      console.error('Game result submission failed:', error);

      // Fallback to local processing
      const maxScore = 50;
      const adjustedScore = Math.min(score, maxScore);
      const prizeCalc = pythManager.calculatePrizeAmount(adjustedScore, maxScore);
      const levelBonus = (level - 1) * 0.1;
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
        blockchainVerified: false,
        error: 'Blockchain submission failed - result stored locally',
      };

      setGameResult(result);
    } finally {
      setIsSubmittingResult(false);
      setShowGame(false);
    }
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
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center text-3xl">
            🌋
          </div>
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-light text-white tracking-tight">
              Lava Platform Jumper
            </h1>
            <p className="text-slate-300 text-lg">
              Welcome back, <span className="text-amber-400 font-semibold">{athleteData.ensName}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-slate-900/30 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/30 text-center">
          <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            🎮
          </div>
          <div className="text-3xl font-semibold text-amber-400 mb-1">{athleteData.gamesPlayed || 0}</div>
          <div className="text-slate-400 text-sm font-medium">Games Played</div>
        </div>
        <div className="bg-slate-900/30 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/30 text-center">
          <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            🏆
          </div>
          <div className="text-3xl font-semibold text-green-400 mb-1">{athleteData.bestScore || 0}</div>
          <div className="text-slate-400 text-sm font-medium">Best Score</div>
        </div>
        <div className="bg-slate-900/30 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/30 text-center">
          <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            💰
          </div>
          <div className="text-3xl font-semibold text-blue-400 mb-1">${wldPrice.toFixed(3)}</div>
          <div className="text-slate-400 text-sm font-medium">WLD Price</div>
        </div>
        <div className="bg-slate-900/30 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/30 text-center">
          <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            🪙
          </div>
          <div className="text-3xl font-semibold text-purple-400 mb-1">{athleteData.totalWinnings || '0.0000'}</div>
          <div className="text-slate-400 text-sm font-medium">Total WLD Won</div>
        </div>
      </div>

      {/* Game Area */}
      <div className="bg-slate-900/30 backdrop-blur-sm rounded-3xl border border-slate-700/30 p-8 mb-12">
        {!showGame && !gameResult ? (
          <div className="text-center py-16">
            <div className="mb-8">
              <div className="text-7xl mb-6">🏃‍♂️🌋</div>
              <h2 className="text-3xl font-semibold text-white mb-4">Ready to Escape the Lava?</h2>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Master precision platforming to escape rising lava. The higher you climb, the greater your rewards.
              </p>
            </div>

            <div className="mb-8">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                <span>Max Prize: {currentPrize}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-10 max-w-2xl mx-auto">
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-600/30">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  🟫
                </div>
                <div className="text-amber-400 font-semibold mb-1">Normal</div>
                <div className="text-slate-400 text-sm">Regular platforms</div>
              </div>
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-600/30">
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  🟢
                </div>
                <div className="text-green-400 font-semibold mb-1">Bonus</div>
                <div className="text-slate-400 text-sm">+5 points, higher jump</div>
              </div>
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-600/30">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  🔴
                </div>
                <div className="text-red-400 font-semibold mb-1">Danger</div>
                <div className="text-slate-400 text-sm">-2 points penalty</div>
              </div>
            </div>

            <button
              onClick={startNewGame}
              className="group relative bg-gradient-to-r from-orange-500 to-red-500 text-white px-12 py-4 rounded-2xl font-bold text-xl transition-all duration-300 hover:from-orange-600 hover:to-red-600 hover:shadow-lg hover:shadow-orange-500/25 transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                🌋 Start Climbing!
              </span>
            </button>
          </div>
        ) : showGame ? (
          <div className="text-center">
            <LavaPlatformGame onGameEnd={handleGameEnd} />
            {isSubmittingResult && (
              <div className="mt-6 bg-blue-900/30 border border-blue-600/50 rounded-2xl p-6">
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                  <span className="text-blue-200 font-medium text-lg">Submitting to blockchain...</span>
                </div>
                <p className="text-blue-300/70 text-sm mt-2">Processing your game result on World Chain Sepolia</p>
              </div>
            )}
          </div>
        ) : (
          gameResult && (
            <div className="text-center py-12">
              <div className="mb-8">
                <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  🏆
                </div>
                <h2 className="text-4xl font-semibold text-white mb-2">Game Complete!</h2>
                <p className="text-slate-300 text-lg">Outstanding performance on the platform</p>
              </div>

              <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl p-8 mb-8 max-w-lg mx-auto border border-slate-600/30">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">{gameResult.score}</div>
                    <div className="text-slate-400 text-sm font-medium">Final Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-1">Level {gameResult.level}</div>
                    <div className="text-slate-400 text-sm font-medium">Level Reached</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-yellow-400 mb-1">
                      {((gameResult.score / gameResult.maxScore) * 100).toFixed(1)}%
                    </div>
                    <div className="text-slate-400 text-sm font-medium">Performance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-yellow-400 mb-1">{gameResult.prize.multiplier}x</div>
                    <div className="text-slate-400 text-sm font-medium">Multiplier</div>
                  </div>
                </div>

                <div className="border-t border-slate-600/50 pt-6">
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-green-400 mb-2">
                      {gameResult.prize.wldAmount.toFixed(4)} WLD
                    </div>
                    <div className="text-slate-400 text-lg">
                      ≈ ${gameResult.prize.usdAmount.toFixed(2)} USD
                    </div>
                  </div>

                  <div className="space-y-2">
                    {gameResult.level > 1 && (
                      <div className="bg-orange-500/20 rounded-xl p-3">
                        <div className="text-orange-300 text-sm font-medium">
                          🔥 Level {gameResult.level} Bonus: +{((gameResult.level - 1) * 10)}%
                        </div>
                      </div>
                    )}
                    {gameResult.blockchainVerified && gameResult.txHash && (
                      <div className="bg-green-500/20 rounded-xl p-3">
                        <div className="text-green-300 text-sm font-medium">
                          ✅ Verified on blockchain
                        </div>
                      </div>
                    )}
                    {gameResult.error && (
                      <div className="bg-red-500/20 rounded-xl p-3">
                        <div className="text-red-300 text-sm font-medium">
                          ⚠️ {gameResult.error}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={startNewGame}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25"
                >
                  🔄 Play Again
                </button>
                <button
                  onClick={() => router.push('/leaderboard')}
                  className="bg-slate-800/50 border border-slate-600/50 hover:bg-slate-700/50 hover:border-slate-500/50 text-slate-200 px-8 py-3 rounded-2xl font-semibold transition-all duration-300"
                >
                  🏆 View Leaderboard
                </button>
                {gameResult.txHash && (
                  <button
                    onClick={() => window.open(blockchainManager.getBlockExplorerUrl(gameResult.txHash), '_blank')}
                    className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 hover:border-blue-400 text-blue-200 hover:text-blue-100 px-8 py-3 rounded-2xl font-semibold transition-all duration-300"
                  >
                    🔗 View Transaction
                  </button>
                )}
              </div>
            </div>
          )
        )}
      </div>

      {/* Game Instructions */}
      <div className="bg-slate-900/30 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/30">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              🎮
            </div>
            <h3 className="text-2xl font-semibold text-white">How to Play</h3>
          </div>
          <p className="text-slate-400">Master the controls and dominate the leaderboard</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                🎯
              </div>
              <div>
                <div className="text-white font-semibold mb-1">Objective</div>
                <div className="text-slate-400 text-sm leading-relaxed">
                  Climb as high as possible to escape the rising lava and maximize your WLD rewards.
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                ⌨️
              </div>
              <div>
                <div className="text-white font-semibold mb-1">Controls</div>
                <div className="text-slate-400 text-sm leading-relaxed">
                  Arrow keys or WASD to move, Space/Up to jump. Precise timing is key.
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                📱
              </div>
              <div>
                <div className="text-white font-semibold mb-1">Mobile</div>
                <div className="text-slate-400 text-sm leading-relaxed">
                  Touch screen to move character, tap to jump. Optimized for mobile play.
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                🔥
              </div>
              <div>
                <div className="text-white font-semibold mb-1">Lava Mechanics</div>
                <div className="text-slate-400 text-sm leading-relaxed">
                  Lava rises faster each level. Stay ahead or face elimination.
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                💰
              </div>
              <div>
                <div className="text-white font-semibold mb-1">Scoring</div>
                <div className="text-slate-400 text-sm leading-relaxed">
                  Height climbed + platform bonuses. Level multipliers increase rewards.
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                🏆
              </div>
              <div>
                <div className="text-white font-semibold mb-1">Prizes</div>
                <div className="text-slate-400 text-sm leading-relaxed">
                  Dynamic WLD rewards via real-time Pyth Network price feeds.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}