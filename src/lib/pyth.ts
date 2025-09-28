import { PYTH_CONFIG, GAME_CONFIG } from './config';

export interface PythPriceFeed {
  id: string;
  price: {
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
  };
  ema_price: {
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
  };
}

export interface PythPriceData {
  price: number;
  timestamp: number;
  confidence: number;
  publishTime: number;
}

export class PythPriceManager {
  private static instance: PythPriceManager;
  private wldPrice: number = 2.50; // Fallback price
  private lastUpdate: number = 0;
  private priceCache: Map<string, PythPriceData> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds cache

  private constructor() {}

  public static getInstance(): PythPriceManager {
    if (!PythPriceManager.instance) {
      PythPriceManager.instance = new PythPriceManager();
    }
    return PythPriceManager.instance;
  }

  /**
   * Fetch real WLD/USD price from Pyth Hermes API
   */
  public async fetchWLDPrice(): Promise<PythPriceData> {
    try {
      // Check cache first
      const cached = this.priceCache.get('WLD/USD');
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log('Using cached Pyth price:', cached);
        return cached;
      }

      // Fetch from Pyth Hermes API
      const response = await fetch(
        `${PYTH_CONFIG.HERMES_ENDPOINT}/v2/updates/price/latest?ids[]=${PYTH_CONFIG.WLD_USD_FEED_ID}&parsed=true`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Pyth API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.parsed || !data.parsed[0]) {
        throw new Error('Invalid Pyth API response structure');
      }

      const priceFeed: PythPriceFeed = data.parsed[0];

      // Parse price data
      const rawPrice = parseInt(priceFeed.price.price);
      const expo = priceFeed.price.expo;
      const confidence = parseInt(priceFeed.price.conf);
      const publishTime = priceFeed.price.publish_time;

      // Convert price using exponent
      const price = rawPrice * Math.pow(10, expo);
      const confidenceValue = confidence * Math.pow(10, expo);

      const priceData: PythPriceData = {
        price: Math.max(0.1, parseFloat(price.toFixed(6))),
        timestamp: Date.now(),
        confidence: confidenceValue,
        publishTime: publishTime * 1000, // Convert to milliseconds
      };

      // Update cache and instance variables
      this.priceCache.set('WLD/USD', priceData);
      this.wldPrice = priceData.price;
      this.lastUpdate = priceData.timestamp;

      console.log('Real Pyth Network price fetched:', {
        feedId: PYTH_CONFIG.WLD_USD_FEED_ID,
        price: priceData.price,
        confidence: confidenceValue,
        publishTime: new Date(priceData.publishTime).toISOString(),
        source: 'Pyth Hermes API'
      });

      return priceData;

    } catch (error) {
      console.error('Failed to fetch real WLD price from Pyth:', error);

      // Return cached price if available
      const cached = this.priceCache.get('WLD/USD');
      if (cached) {
        console.log('Using cached price due to fetch error:', cached);
        return cached;
      }

      // Return fallback price as last resort
      const fallbackData: PythPriceData = {
        price: this.wldPrice,
        timestamp: Date.now(),
        confidence: 0.01,
        publishTime: this.lastUpdate || Date.now(),
      };

      console.log('Using fallback price due to fetch error:', fallbackData);
      return fallbackData;
    }
  }

  public getCurrentPrice(): number {
    return this.wldPrice;
  }

  public async calculatePrizeAmount(score: number, maxScore: number): Promise<{
    usdAmount: number;
    wldAmount: number;
    multiplier: number;
    priceData: PythPriceData;
  }> {
    const { BASE_AMOUNT_USD, MIN_PRIZE_USD, MAX_PRIZE_USD } = GAME_CONFIG.PRIZE_POOL;

    // Get real-time WLD price from Pyth
    const priceData = await this.fetchWLDPrice();

    // Calculate performance multiplier (0.1x to 2x based on score)
    const performanceRatio = score / maxScore;
    const multiplier = Math.max(0.1, Math.min(2.0, performanceRatio * 2));

    // Calculate USD prize amount
    const usdAmount = Math.max(
      MIN_PRIZE_USD,
      Math.min(MAX_PRIZE_USD, BASE_AMOUNT_USD * multiplier)
    );

    // Convert to WLD based on real-time Pyth price
    const wldAmount = parseFloat((usdAmount / priceData.price).toFixed(4));

    console.log('Prize calculation using real Pyth price:', {
      score,
      maxScore,
      multiplier,
      usdAmount,
      wldPrice: priceData.price,
      wldAmount,
      priceSource: 'Pyth Network',
      publishTime: new Date(priceData.publishTime).toISOString(),
    });

    return {
      usdAmount: parseFloat(usdAmount.toFixed(2)),
      wldAmount,
      multiplier: parseFloat(multiplier.toFixed(2)),
      priceData,
    };
  }

  public async formatPriceDisplay(wldAmount: number): Promise<string> {
    const priceData = await this.fetchWLDPrice();
    return `${wldAmount.toFixed(4)} WLD (~$${(wldAmount * priceData.price).toFixed(2)})`;
  }

  /**
   * Get real-time price feed data from Pyth Network
   */
  public async getPriceFeedData(): Promise<{
    feedId: string;
    price: number;
    timestamp: number;
    confidence: number;
    publishTime: number;
    source: string;
  }> {
    const priceData = await this.fetchWLDPrice();

    return {
      feedId: PYTH_CONFIG.WLD_USD_FEED_ID,
      price: priceData.price,
      timestamp: priceData.timestamp,
      confidence: priceData.confidence,
      publishTime: priceData.publishTime,
      source: 'Pyth Network Hermes API',
    };
  }

  /**
   * Get multiple price feeds at once
   */
  public async getBatchPriceData(feedIds: string[]): Promise<Map<string, PythPriceData>> {
    const results = new Map<string, PythPriceData>();

    try {
      const idsParam = feedIds.map(id => `ids[]=${id}`).join('&');
      const response = await fetch(
        `${PYTH_CONFIG.HERMES_ENDPOINT}/v2/updates/price/latest?${idsParam}&parsed=true`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Pyth batch API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.parsed && Array.isArray(data.parsed)) {
        data.parsed.forEach((feed: PythPriceFeed) => {
          const rawPrice = parseInt(feed.price.price);
          const expo = feed.price.expo;
          const confidence = parseInt(feed.price.conf);
          const publishTime = feed.price.publish_time;

          const price = rawPrice * Math.pow(10, expo);
          const confidenceValue = confidence * Math.pow(10, expo);

          results.set(feed.id, {
            price: Math.max(0.1, parseFloat(price.toFixed(6))),
            timestamp: Date.now(),
            confidence: confidenceValue,
            publishTime: publishTime * 1000,
          });
        });
      }

      console.log(`Fetched ${results.size} price feeds from Pyth:`, Array.from(results.keys()));
      return results;

    } catch (error) {
      console.error('Failed to fetch batch price data:', error);
      return results; // Return empty map on error
    }
  }

  /**
   * Get price history (limited by Hermes API capabilities)
   */
  public async getPriceHistory(
    feedId: string,
    startTime: number,
    endTime: number
  ): Promise<PythPriceData[]> {
    try {
      const response = await fetch(
        `${PYTH_CONFIG.HERMES_ENDPOINT}/v2/updates/price/${startTime}/${endTime}?ids[]=${feedId}&parsed=true`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Pyth history API error: ${response.status}`);
      }

      const data = await response.json();
      const history: PythPriceData[] = [];

      if (data.parsed && Array.isArray(data.parsed)) {
        data.parsed.forEach((feed: PythPriceFeed) => {
          const rawPrice = parseInt(feed.price.price);
          const expo = feed.price.expo;
          const confidence = parseInt(feed.price.conf);
          const publishTime = feed.price.publish_time;

          const price = rawPrice * Math.pow(10, expo);
          const confidenceValue = confidence * Math.pow(10, expo);

          history.push({
            price: parseFloat(price.toFixed(6)),
            timestamp: publishTime * 1000,
            confidence: confidenceValue,
            publishTime: publishTime * 1000,
          });
        });
      }

      return history.sort((a, b) => a.timestamp - b.timestamp);

    } catch (error) {
      console.error('Failed to fetch price history:', error);
      return [];
    }
  }

  /**
   * Check if Pyth price feed is healthy
   */
  public async isPriceFeedHealthy(maxAgeSeconds: number = 60): Promise<boolean> {
    try {
      const priceData = await this.fetchWLDPrice();
      const ageSeconds = (Date.now() - priceData.publishTime) / 1000;

      return ageSeconds <= maxAgeSeconds;
    } catch (error) {
      console.error('Error checking price feed health:', error);
      return false;
    }
  }
}