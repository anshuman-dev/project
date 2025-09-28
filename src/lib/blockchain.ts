import { ethers } from 'ethers';
import { CURRENT_NETWORK } from './config';

// World Chain Mainnet configuration - LIVE DEPLOYMENT
export const CURRENT_CHAIN_CONFIG = {
  ...CURRENT_NETWORK,
  blockExplorer: 'https://worldscan.org',
  contracts: {
    chainOlympics: '0x630db23f93918176af66ffa83614a120d61004e8', // ✅ LIVE ON WORLD CHAIN MAINNET
    worldIdRouter: '0x163b09b4fE21177c455D850BD815B6D583732432', // World ID Router - World Chain Mainnet
    wldToken: '0x2cFc85d8E714Ba6C0d01A86C66c0741c7b75F7B4', // WLD Token - World Chain Mainnet
  },
};

// Contract ABI (simplified for key functions)
const CHAIN_OLYMPICS_ABI = [
  'function verifyAndRegisterAthlete(address athlete, string ensName, string country, uint256 root, uint256 nullifierHash, uint256[8] proof)',
  'function submitGameResult(uint256 score, uint256 level, string gameType)',
  'function getAthlete(address athleteAddr) view returns (tuple(address wallet, string ensName, string country, uint256 totalGames, uint256 bestScore, uint256 totalWinnings, bool isVerified, uint256 registeredAt))',
  'function getLeaderboard() view returns (address[], string[], string[], uint256[], uint256[], uint256[])',
  'function athletes(address) view returns (address, string, string, uint256, uint256, uint256, bool, uint256)',
  'event AthleteRegistered(address indexed athlete, string ensName, string country)',
  'event GameCompleted(address indexed athlete, uint256 score, uint256 level, uint256 prize)',
  'event WorldIDVerified(address indexed athlete, uint256 nullifierHash)',
];

export interface ChainAthlete {
  wallet: string;
  ensName: string;
  country: string;
  totalGames: number;
  bestScore: number;
  totalWinnings: string;
  isVerified: boolean;
  registeredAt: number;
}

export interface GameTransaction {
  hash: string;
  score: number;
  level: number;
  prizeAmount: string;
  timestamp: number;
  blockNumber: number;
}

export class BlockchainManager {
  private static instance: BlockchainManager;
  private provider: ethers.providers.JsonRpcProvider;
  private contract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;

  private constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(CURRENT_CHAIN_CONFIG.rpcUrl);
  }

  public static getInstance(): BlockchainManager {
    if (!BlockchainManager.instance) {
      BlockchainManager.instance = new BlockchainManager();
    }
    return BlockchainManager.instance;
  }

  async connectWallet(): Promise<{ success: boolean; address?: string; error?: string }> {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        return { success: false, error: 'MetaMask not installed' };
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Setup Web3Provider with MetaMask
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = web3Provider.getSigner();
      const address = await this.signer.getAddress();

      // Initialize contract with signer
      this.contract = new ethers.Contract(
        CURRENT_CHAIN_CONFIG.contracts.chainOlympics,
        CHAIN_OLYMPICS_ABI,
        this.signer
      );

      // Check if we're on the correct network
      const network = await web3Provider.getNetwork();
      if (network.chainId !== CURRENT_CHAIN_CONFIG.chainId) {
        await this.switchToWorldChain();
      }

      return { success: true, address };
    } catch (error) {
      console.error('Wallet connection error:', error);
      return { success: false, error: 'Failed to connect wallet' };
    }
  }

  private async switchToWorldChain(): Promise<void> {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CURRENT_CHAIN_CONFIG.chainId.toString(16)}` }],
      });
    } catch (switchError: unknown) {
      // If the chain doesn't exist, add it
      if ((switchError as { code: number }).code === 4902) { // eslint-disable-line @typescript-eslint/no-explicit-any
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${CURRENT_CHAIN_CONFIG.chainId.toString(16)}`,
              chainName: CURRENT_CHAIN_CONFIG.name,
              rpcUrls: [CURRENT_CHAIN_CONFIG.rpcUrl],
              blockExplorerUrls: [CURRENT_CHAIN_CONFIG.blockExplorer],
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
            },
          ],
        });
      }
    }
  }

  async registerAthlete(
    athleteData: {
      ensName: string;
      country: string;
      address: string;
    },
    worldIdProof: {
      root: string;
      nullifierHash: string;
      proof: string[];
    }
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.contract || !this.signer) {
        return { success: false, error: 'Wallet not connected' };
      }

      // Real blockchain transaction to World Chain mainnet
      const tx = await this.contract.verifyAndRegisterAthlete(
        athleteData.address,
        athleteData.ensName,
        athleteData.country,
        worldIdProof.root,
        worldIdProof.nullifierHash,
        worldIdProof.proof
      );

      console.log('Real blockchain transaction submitted:', {
        txHash: tx.hash,
        athlete: athleteData.address,
        ensName: athleteData.ensName,
        country: athleteData.country,
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.transactionHash);

      return { success: true, txHash: receipt.transactionHash };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  async submitGameResult(
    score: number,
    level: number,
    gameType: string = 'lava-platform-jumper'
  ): Promise<{ success: boolean; txHash?: string; prizeAmount?: string; error?: string }> {
    try {
      if (!this.contract || !this.signer) {
        return { success: false, error: 'Wallet not connected' };
      }

      // Calculate expected prize (same logic as smart contract)
      const basePrize = (score * 0.1) / 50; // Up to 0.1 WLD for perfect score
      const levelBonus = (level - 1) * (basePrize / 10);
      const totalPrize = Math.min(basePrize + levelBonus, 5); // Cap at 5 WLD

      // Real blockchain transaction for game result submission
      const tx = await this.contract.submitGameResult(
        score,
        level,
        gameType
      );

      console.log('Real game result transaction submitted:', {
        txHash: tx.hash,
        score,
        level,
        gameType,
        expectedPrize: totalPrize,
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Game result transaction confirmed:', receipt.transactionHash);

      return {
        success: true,
        txHash: receipt.transactionHash,
        prizeAmount: totalPrize.toFixed(4),
      };
    } catch (error) {
      console.error('Game submission error:', error);
      return { success: false, error: 'Game submission failed' };
    }
  }

  async getAthleteData(address: string): Promise<ChainAthlete | null> {
    try {
      // For demo purposes, return mock data based on localStorage
      const stored = localStorage.getItem('chainolympics_athlete');
      if (!stored) return null;

      const localData = JSON.parse(stored);

      // Simulate blockchain data structure
      return {
        wallet: address,
        ensName: localData.ensName || '',
        country: localData.country || '',
        totalGames: localData.gamesPlayed || 0,
        bestScore: localData.bestScore || 0,
        totalWinnings: localData.totalWinnings || '0.0000',
        isVerified: localData.isVerified || false,
        registeredAt: Date.now(),
      };
    } catch (error) {
      console.error('Error fetching athlete data:', error);
      return null;
    }
  }

  async getLeaderboard(): Promise<ChainAthlete[]> {
    try {
      // For demo purposes, return data from localStorage
      // In production, this would query the smart contract
      const stored = localStorage.getItem('chainolympics_athlete');
      if (!stored) return [];

      const localData = JSON.parse(stored);
      if (localData.gamesPlayed > 0) {
        return [{
          wallet: localData.walletAddress || '0x0000000000000000000000000000000000000000',
          ensName: localData.ensName || '',
          country: localData.country || '',
          totalGames: localData.gamesPlayed || 0,
          bestScore: localData.bestScore || 0,
          totalWinnings: localData.totalWinnings || '0.0000',
          isVerified: localData.isVerified || false,
          registeredAt: Date.now(),
        }];
      }

      return [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  async getTransactionDetails(txHash: string): Promise<GameTransaction | null> {
    try {
      // For demo purposes, return mock transaction data
      return {
        hash: txHash,
        score: 45,
        level: 3,
        prizeAmount: '0.1250',
        timestamp: Date.now(),
        blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
      };
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }

  getBlockExplorerUrl(txHash: string): string {
    return `${CURRENT_CHAIN_CONFIG.blockExplorer}/tx/${txHash}`;
  }

  formatAddress(address: string): string {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
}

// Global instance
export const blockchainManager = BlockchainManager.getInstance();

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}