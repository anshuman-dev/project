import { MiniKit } from '@worldcoin/minikit-js';
import { WORLDCOIN_CONFIG } from './config';

export class MiniKitManager {
  private static instance: MiniKitManager;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): MiniKitManager {
    if (!MiniKitManager.instance) {
      MiniKitManager.instance = new MiniKitManager();
    }
    return MiniKitManager.instance;
  }

  public initialize(): void {
    if (this.isInitialized) return;

    if (typeof window !== 'undefined' && MiniKit.isInstalled()) {
      this.isInitialized = true;
    }
  }

  public isReady(): boolean {
    return this.isInitialized && MiniKit.isInstalled();
  }

  public async verifyWorldID(): Promise<{ success: boolean; proof?: unknown; error?: string }> {
    if (!this.isReady()) {
      return { success: false, error: 'MiniKit not available' };
    }

    try {
      const verifyPayload = {
        action: WORLDCOIN_CONFIG.ACTION_ID,
        signal: 'chainolympics-athlete-registration',
        // verification_level: 'device' as const,
      };

      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

      if (finalPayload.status === 'success') {
        return { success: true, proof: finalPayload };
      } else {
        return { success: false, error: 'Verification failed' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  public async sendTransaction(transaction: unknown): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    if (!this.isReady()) {
      return { success: false, error: 'MiniKit not available' };
    }

    try {
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: transaction as any // eslint-disable-line @typescript-eslint/no-explicit-any
      });

      if (finalPayload.status === 'success') {
        return { success: true, transactionId: finalPayload.transaction_id };
      } else {
        return { success: false, error: 'Transaction failed' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  public async pay(amount: string, description: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    if (!this.isReady()) {
      return { success: false, error: 'MiniKit not available' };
    }

    try {
      const { finalPayload } = await MiniKit.commandsAsync.pay({
        reference: Date.now().toString(),
        to: WORLDCOIN_CONFIG.APP_ID,
        tokens: [
          {
            symbol: 'WLD' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
            token_amount: amount,
          }
        ],
        description,
      });

      if (finalPayload.status === 'success') {
        return { success: true, transactionId: finalPayload.transaction_id };
      } else {
        return { success: false, error: 'Payment failed' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}