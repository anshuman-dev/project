import { PYTH_CONFIG, GAME_CONFIG } from './config';

export class PythPriceManager {
  private static instance: PythPriceManager;
  private wldPrice: number = 2.50; // Fallback price
  private lastUpdate: number = 0;

  private constructor() {}

  public static getInstance(): PythPriceManager {
    if (!PythPriceManager.instance) {
      PythPriceManager.instance = new PythPriceManager();
    }
    return PythPriceManager.instance;
  }

  // Simulate fetching price from Pyth Network
  public async fetchWLDPrice(): Promise<{ price: number; timestamp: number }> {
    try {
      // In real implementation, this would fetch from Pyth Hermes endpoint
      // For demo, we'll simulate price movements
      const basePrice = 2.50;
      const volatility = 0.1;
      const randomFactor = (Math.random() - 0.5) * volatility;
      const simulatedPrice = basePrice + (basePrice * randomFactor);

      const priceData = {
        price: Math.max(0.1, parseFloat(simulatedPrice.toFixed(3))),
        timestamp: Date.now(),
      };

      this.wldPrice = priceData.price;
      this.lastUpdate = priceData.timestamp;

      return priceData;
    } catch (error) {
      console.error('Failed to fetch WLD price:', error);
      // Return cached price as fallback
      return {
        price: this.wldPrice,
        timestamp: this.lastUpdate || Date.now(),
      };
    }
  }

  public getCurrentPrice(): number {
    return this.wldPrice;
  }

  public calculatePrizeAmount(score: number, maxScore: number): {
    usdAmount: number;
    wldAmount: number;
    multiplier: number;
  } {
    const { BASE_AMOUNT_USD, MIN_PRIZE_USD, MAX_PRIZE_USD } = GAME_CONFIG.PRIZE_POOL;

    // Calculate performance multiplier (0.1x to 2x based on score)
    const performanceRatio = score / maxScore;
    const multiplier = Math.max(0.1, Math.min(2.0, performanceRatio * 2));

    // Calculate USD prize amount
    const usdAmount = Math.max(
      MIN_PRIZE_USD,
      Math.min(MAX_PRIZE_USD, BASE_AMOUNT_USD * multiplier)
    );

    // Convert to WLD based on current price
    const wldAmount = parseFloat((usdAmount / this.wldPrice).toFixed(4));

    return {
      usdAmount: parseFloat(usdAmount.toFixed(2)),
      wldAmount,
      multiplier: parseFloat(multiplier.toFixed(2)),
    };
  }

  public formatPriceDisplay(wldAmount: number): string {
    return `${wldAmount.toFixed(4)} WLD (~$${(wldAmount * this.wldPrice).toFixed(2)})`;
  }

  // Real implementation would interact with Pyth smart contract
  public async updatePriceOnChain(): Promise<{ success: boolean; transactionId?: string }> {
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        transactionId: `0x${Math.random().toString(16).substr(2, 64)}`,
      };
    } catch (error) {
      return {
        success: false,
      };
    }
  }

  // Simulate price feed data structure that would come from Pyth
  public getPriceFeedData() {
    return {
      feedId: PYTH_CONFIG.WLD_USD_FEED_ID,
      price: this.wldPrice,
      timestamp: this.lastUpdate,
      confidence: 0.001, // Price confidence interval
      expo: -8, // Price exponent
    };
  }
}