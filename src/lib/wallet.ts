import { useMiniKit } from '@/components/MiniKitProvider';

// Type definitions for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  ensName: string | null;
}

export class WalletManager {
  private static instance: WalletManager;
  private walletState: WalletState = {
    isConnected: false,
    address: null,
    ensName: null,
  };

  private constructor() {}

  public static getInstance(): WalletManager {
    if (!WalletManager.instance) {
      WalletManager.instance = new WalletManager();
    }
    return WalletManager.instance;
  }

  // Check if user has connected wallet through World App or browser
  public async connectWallet(): Promise<{ success: boolean; address?: string; error?: string }> {
    try {
      if (typeof window === 'undefined') {
        return { success: false, error: 'Window not available' };
      }

      // Check if we have a stored wallet connection from a previous session
      const storedWallet = localStorage.getItem('chainolympics_wallet');
      if (storedWallet) {
        const wallet = JSON.parse(storedWallet);
        this.walletState = {
          isConnected: true,
          address: wallet.address,
          ensName: wallet.ensName,
        };
        return { success: true, address: wallet.address };
      }

      // Try to connect to browser wallet (MetaMask, etc.)
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
          if (accounts.length > 0) {
            const address = accounts[0];
            const walletData = {
              address,
              ensName: null,
              connectedAt: new Date().toISOString(),
            };

            localStorage.setItem('chainolympics_wallet', JSON.stringify(walletData));

            this.walletState = {
              isConnected: true,
              address,
              ensName: null,
            };

            return { success: true, address };
          }
        } catch (error) {
          console.error('Browser wallet connection failed:', error);
          return { success: false, error: 'Failed to connect to browser wallet' };
        }
      }

      // In World App, the wallet should be automatically available
      // If we reach here, no wallet is available
      return {
        success: false,
        error: 'No wallet found. Please install MetaMask or open in World App.'
      };

    } catch (error) {
      console.error('Wallet connection failed:', error);
      return { success: false, error: 'Failed to connect wallet' };
    }
  }

  public getWalletState(): WalletState {
    return this.walletState;
  }

  public disconnect(): void {
    localStorage.removeItem('chainolympics_wallet');
    this.walletState = {
      isConnected: false,
      address: null,
      ensName: null,
    };
  }

  public formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}