'use client';

import { useState, useEffect } from 'react';
import { PythPriceManager } from '@/lib/pyth';

interface LeaderboardEntry {
  rank: number;
  ensName: string;
  country: string;
  bestScore: number;
  gamesPlayed: number;
  totalWinnings: string;
  accuracy: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentAthlete, setCurrentAthlete] = useState<any>(null);
  const [wldPrice, setWldPrice] = useState(2.50);
  const [totalPrizePool, setTotalPrizePool] = useState('0.0000');
  const pythManager = PythPriceManager.getInstance();

  useEffect(() => {
    // Load current athlete data
    const stored = localStorage.getItem('chainolympics_athlete');
    if (stored) {
      setCurrentAthlete(JSON.parse(stored));
    }

    // Update WLD price
    const updatePrice = async () => {
      const priceData = await pythManager.fetchWLDPrice();
      setWldPrice(priceData.price);
    };
    updatePrice();

    // Start with empty leaderboard - real testnet data only
    const realLeaderboard: LeaderboardEntry[] = [];

    // Add current athlete to leaderboard if they exist and have played games
    if (stored) {
      const athlete = JSON.parse(stored);
      if (athlete.gamesPlayed > 0) {
        const athleteEntry: LeaderboardEntry = {
          rank: 1, // Only real athlete for now
          ensName: athlete.ensName,
          country: athlete.country,
          bestScore: athlete.bestScore || 0,
          gamesPlayed: athlete.gamesPlayed || 0,
          totalWinnings: athlete.totalWinnings || '0.0000',
          accuracy: athlete.bestScore ? (athlete.bestScore / 5) * 100 : 0,
        };
        realLeaderboard.push(athleteEntry);
      }
    }

    setLeaderboard(realLeaderboard);

    // Calculate total prize pool from real winnings
    const totalWinnings = realLeaderboard.reduce((sum, athlete) => sum + parseFloat(athlete.totalWinnings), 0);
    setTotalPrizePool(totalWinnings.toFixed(4));
  }, [pythManager]);

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'United States': '🇺🇸',
      'Canada': '🇨🇦',
      'United Kingdom': '🇬🇧',
      'Germany': '🇩🇪',
      'Japan': '🇯🇵',
      'Australia': '🇦🇺',
      'France': '🇫🇷',
      'Brazil': '🇧🇷',
      'India': '🇮🇳',
      'China': '🇨🇳',
    };
    return flags[country] || '🌍';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Global Leaderboard</h1>
        <p className="text-gray-300 text-lg">Top performers in ChainOlympics competitions</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{leaderboard.length}</div>
          <div className="text-purple-100 text-sm">Total Athletes</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-blue-500 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{totalPrizePool}</div>
          <div className="text-green-100 text-sm">Total Prizes (WLD)</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">${wldPrice.toFixed(3)}</div>
          <div className="text-yellow-100 text-sm">Current WLD Price</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {leaderboard.reduce((sum, athlete) => sum + athlete.gamesPlayed, 0)}
          </div>
          <div className="text-red-100 text-sm">Games Played</div>
        </div>
      </div>

      {/* Current Athlete Status */}
      {currentAthlete && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 border border-blue-400">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Your Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-blue-200">Best Score</div>
                  <div className="text-white font-bold">{currentAthlete.bestScore || 0}/5</div>
                </div>
                <div>
                  <div className="text-blue-200">Games Played</div>
                  <div className="text-white font-bold">{currentAthlete.gamesPlayed || 0}</div>
                </div>
                <div>
                  <div className="text-blue-200">Total Winnings</div>
                  <div className="text-white font-bold">{currentAthlete.totalWinnings || '0.0000'} WLD</div>
                </div>
                <div>
                  <div className="text-blue-200">Rank</div>
                  <div className="text-white font-bold">
                    {leaderboard.find(entry => entry.ensName === currentAthlete.ensName)?.rank || 'Unranked'}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl mb-2">{getCountryFlag(currentAthlete.country)}</div>
              <div className="text-white font-medium">{currentAthlete.ensName}</div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4">
          <h2 className="text-xl font-bold text-black">🏆 Top Athletes</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="text-left">
                <th className="p-4 text-gray-300 font-medium">Rank</th>
                <th className="p-4 text-gray-300 font-medium">Athlete</th>
                <th className="p-4 text-gray-300 font-medium">Country</th>
                <th className="p-4 text-gray-300 font-medium">Best Score</th>
                <th className="p-4 text-gray-300 font-medium">Games</th>
                <th className="p-4 text-gray-300 font-medium">Accuracy</th>
                <th className="p-4 text-gray-300 font-medium">Total Winnings</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr
                  key={entry.ensName}
                  className={`border-t border-white/10 hover:bg-white/5 transition-colors ${
                    entry.ensName === currentAthlete?.ensName ? 'bg-blue-500/20 border-blue-400' : ''
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getRankBadge(entry.rank)}</span>
                      <span className="text-white font-bold">{entry.rank}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-medium">{entry.ensName}</div>
                    {entry.ensName === currentAthlete?.ensName && (
                      <div className="text-blue-400 text-sm">You</div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getCountryFlag(entry.country)}</span>
                      <span className="text-gray-300">{entry.country}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-bold">{entry.bestScore}/5</div>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-300">{entry.gamesPlayed}</div>
                  </td>
                  <td className="p-4">
                    <div className={`font-medium ${
                      entry.accuracy >= 90 ? 'text-green-400' :
                      entry.accuracy >= 80 ? 'text-yellow-400' : 'text-orange-400'
                    }`}>
                      {entry.accuracy.toFixed(1)}%
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-green-400 font-bold">{entry.totalWinnings} WLD</div>
                    <div className="text-gray-400 text-sm">
                      ≈ ${(parseFloat(entry.totalWinnings) * wldPrice).toFixed(2)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-3">How Rankings Work</h3>
          <div className="space-y-2 text-gray-300 text-sm">
            <p>• Rankings based on <strong>best score</strong> then total winnings</p>
            <p>• All scores are <strong>verified</strong> through World ID</p>
            <p>• <strong>Real-time updates</strong> powered by The Graph indexing</p>
            <p>• <strong>Cross-game rankings</strong> coming soon</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-3">Prize Distribution</h3>
          <div className="space-y-2 text-gray-300 text-sm">
            <p>• Prizes calculated using <strong>Pyth price feeds</strong></p>
            <p>• Dynamic pricing based on <strong>WLD market value</strong></p>
            <p>• Performance multipliers up to <strong>2x</strong></p>
            <p>• All transactions on <strong>World Chain</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}