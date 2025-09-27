import { useMiniKit } from '@/components/MiniKitProvider';

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

  // Check if user has connected wallet through World App
  public async connectWallet(): Promise<{ success: boolean; address?: string; error?: string }> {
    try {
      // In World App, wallet is automatically connected
      // For demo purposes, we'll simulate wallet detection
      if (typeof window !== 'undefined') {
        // Check if we have a stored wallet connection
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

        // For new users, generate a wallet address (in real app, this comes from World App)
        const newAddress = this.generateTestAddress();
        const walletData = {
          address: newAddress,
          ensName: null,
          connectedAt: new Date().toISOString(),
        };

        localStorage.setItem('chainolympics_wallet', JSON.stringify(walletData));

        this.walletState = {
          isConnected: true,
          address: newAddress,
          ensName: null,
        };

        return { success: true, address: newAddress };
      }

      return { success: false, error: 'Window not available' };
    } catch (error) {
      return { success: false, error: 'Failed to connect wallet' };
    }
  }

  private generateTestAddress(): string {
    // Generate a realistic-looking Ethereum address for testing
    const chars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
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