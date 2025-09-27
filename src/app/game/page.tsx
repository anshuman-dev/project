'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PythPriceManager } from '@/lib/pyth';
import { GAME_CONFIG } from '@/lib/config';

interface Target {
  id: number;
  x: number;
  y: number;
  isHit: boolean;
}

interface GameState {
  isPlaying: boolean;
  score: number;
  targets: Target[];
  timeLeft: number;
  currentPrize: string;
  gameResult: any;
}

export default function GamePage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    score: 0,
    targets: [],
    timeLeft: GAME_CONFIG.REACTION_GAME.DURATION_MS / 1000,
    currentPrize: '',
    gameResult: null,
  });
  const [athleteData, setAthleteData] = useState<any>(null);
  const [wldPrice, setWldPrice] = useState(2.50);
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

      // Update current prize display
      const maxScore = GAME_CONFIG.REACTION_GAME.TARGET_COUNT;
      const prizeCalc = pythManager.calculatePrizeAmount(maxScore, maxScore);
      setGameState(prev => ({
        ...prev,
        currentPrize: pythManager.formatPriceDisplay(prizeCalc.wldAmount),
      }));
    };

    updatePrice();
    const interval = setInterval(updatePrice, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [pythManager]);

  const generateTargets = useCallback(() => {
    const targets: Target[] = [];
    for (let i = 0; i < GAME_CONFIG.REACTION_GAME.TARGET_COUNT; i++) {
      targets.push({
        id: i,
        x: Math.random() * 80 + 10, // 10-90% of container width
        y: Math.random() * 60 + 20, // 20-80% of container height
        isHit: false,
      });
    }
    return targets;
  }, []);

  const startGame = () => {
    const targets = generateTargets();
    setGameState({
      isPlaying: true,
      score: 0,
      targets,
      timeLeft: GAME_CONFIG.REACTION_GAME.DURATION_MS / 1000,
      currentPrize: gameState.currentPrize,
      gameResult: null,
    });
  };

  const hitTarget = (targetId: number) => {
    if (!gameState.isPlaying) return;

    setGameState(prev => ({
      ...prev,
      score: prev.score + 1,
      targets: prev.targets.map(target =>
        target.id === targetId ? { ...target, isHit: true } : target
      ),
    }));
  };

  const endGame = useCallback(async () => {
    const maxScore = GAME_CONFIG.REACTION_GAME.TARGET_COUNT;
    const prizeCalc = pythManager.calculatePrizeAmount(gameState.score, maxScore);

    const result = {
      score: gameState.score,
      maxScore,
      accuracy: ((gameState.score / maxScore) * 100).toFixed(1),
      prize: prizeCalc,
      timestamp: new Date().toISOString(),
    };

    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      gameResult: result,
    }));

    // Update athlete stats in localStorage
    if (athleteData) {
      const updatedAthlete = {
        ...athleteData,
        gamesPlayed: (athleteData.gamesPlayed || 0) + 1,
        bestScore: Math.max(athleteData.bestScore || 0, gameState.score),
        totalWinnings: (parseFloat(athleteData.totalWinnings || '0') + prizeCalc.wldAmount).toFixed(4),
      };
      localStorage.setItem('chainolympics_athlete', JSON.stringify(updatedAthlete));
      setAthleteData(updatedAthlete);
    }
  }, [gameState.score, pythManager, athleteData]);

  // Game timer
  useEffect(() => {
    if (!gameState.isPlaying || gameState.timeLeft <= 0) return;

    const timer = setTimeout(() => {
      if (gameState.timeLeft <= 1) {
        endGame();
      } else {
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameState.isPlaying, gameState.timeLeft, endGame]);

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
        <h1 className="text-4xl font-bold text-white mb-2">Reaction Speed Challenge</h1>
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
        {!gameState.isPlaying && !gameState.gameResult ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Compete?</h2>
            <p className="text-gray-300 mb-6">
              Click {GAME_CONFIG.REACTION_GAME.TARGET_COUNT} targets as fast as you can in {GAME_CONFIG.REACTION_GAME.DURATION_MS / 1000} seconds!
            </p>
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-full inline-block font-bold text-lg mb-6">
              Max Prize: {gameState.currentPrize}
            </div>
            <br />
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
            >
              🎯 Start Game
            </button>
          </div>
        ) : gameState.isPlaying ? (
          <div>
            {/* Game HUD */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-white font-bold">Score: {gameState.score}/{GAME_CONFIG.REACTION_GAME.TARGET_COUNT}</div>
              <div className="text-white font-bold">Time: {gameState.timeLeft}s</div>
            </div>

            {/* Game Field */}
            <div className="relative bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg h-96 overflow-hidden border-2 border-yellow-400">
              {gameState.targets.map(target => (
                <button
                  key={target.id}
                  onClick={() => hitTarget(target.id)}
                  disabled={target.isHit}
                  className={`absolute w-12 h-12 rounded-full transition-all transform hover:scale-110 ${
                    target.isHit
                      ? 'bg-green-500 animate-ping'
                      : 'bg-red-500 hover:bg-red-400 animate-pulse'
                  }`}
                  style={{
                    left: `${target.x}%`,
                    top: `${target.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {target.isHit ? '✓' : '🎯'}
                </button>
              ))}
            </div>
          </div>
        ) : (
          gameState.gameResult && (
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold text-white mb-4">Game Complete!</h2>

              <div className="bg-white/5 rounded-lg p-6 mb-6 max-w-md mx-auto">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Score:</span>
                    <span className="text-white font-bold">{gameState.gameResult.score}/{gameState.gameResult.maxScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Accuracy:</span>
                    <span className="text-white font-bold">{gameState.gameResult.accuracy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Multiplier:</span>
                    <span className="text-yellow-400 font-bold">{gameState.gameResult.prize.multiplier}x</span>
                  </div>
                  <hr className="border-gray-600" />
                  <div className="flex justify-between">
                    <span className="text-gray-300">Prize Won:</span>
                    <span className="text-green-400 font-bold">
                      {gameState.gameResult.prize.wldAmount.toFixed(4)} WLD
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    ≈ ${gameState.gameResult.prize.usdAmount} USD
                  </div>
                </div>
              </div>

              <div className="space-x-4">
                <button
                  onClick={startGame}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-all"
                >
                  Play Again
                </button>
                <button
                  onClick={() => router.push('/leaderboard')}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-bold transition-all border border-white/20"
                >
                  View Leaderboard
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Instructions */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-3">How to Play</h3>
        <div className="grid md:grid-cols-2 gap-4 text-gray-300 text-sm">
          <div>
            <p>• Click the red targets as fast as possible</p>
            <p>• You have {GAME_CONFIG.REACTION_GAME.DURATION_MS / 1000} seconds to hit {GAME_CONFIG.REACTION_GAME.TARGET_COUNT} targets</p>
            <p>• Higher accuracy = bigger prizes</p>
          </div>
          <div>
            <p>• Prizes are calculated in real-time using Pyth price feeds</p>
            <p>• Your score is permanently recorded on your ENS profile</p>
            <p>• All winnings are tracked for leaderboard rankings</p>
          </div>
        </div>
      </div>
    </div>
  );
}