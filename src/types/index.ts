// Worldcoin types
export interface WorldIDProof {
  proof: string;
  merkle_root: string;
  nullifier_hash: string;
  verification_level: string;
}

// Athlete registration types
export interface AthleteProfile {
  walletAddress: string;
  ensName: string;
  country: string;
  isVerified: boolean;
  gamesPlayed: number;
  bestScore: number;
  totalWinnings: string;
}

// Game types
export interface GameResult {
  playerId: string;
  score: number;
  timestamp: number;
  prizeWon: string;
}

// Pyth price feed types
export interface PriceData {
  price: number;
  timestamp: number;
  confidence: number;
}

export interface PrizePool {
  baseAmount: number;
  currentMultiplier: number;
  totalPrize: string;
  wldPrice: number;
}