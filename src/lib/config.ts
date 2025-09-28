// Worldcoin configuration
export const WORLDCOIN_CONFIG = {
  APP_ID: 'app_0fd177fa7f5e7b015d8b424c4faac8ec',
  ACTION_ID: 'olympic-athlete-verification',
  VERIFICATION_LEVEL: 'device' as const,
} as const;

// ENS/Basename configuration
export const ENS_CONFIG = {
  BASENAME: 'anshuman.base.eth',
  SUBDOMAIN_SUFFIX: '.athlete.eth',
  WALLET_ADDRESS: '0x137c2e26c634073BD42a91f79DEf41A9f80dc1cF',
} as const;

// Pyth Network configuration - MAINNET
export const PYTH_CONFIG = {
  CURRENT_CONTRACT: '0xe9d69cdd6fe41e7b621b4a688c5d1a68cb5c8adc', // Pyth on World Chain Mainnet
  WLD_USD_FEED_ID: '0xd6835ad1f773de4a378115eb6824bd0c0e42d84d1c84d9750e853fb6b6c7794a', // WLD/USD price feed
  HERMES_ENDPOINT: 'https://hermes.pyth.network',
} as const;

// World Chain network configuration
export const WORLD_CHAIN_CONFIG = {
  TESTNET: {
    chainId: 4801,
    name: 'World Chain Sepolia',
    rpcUrl: 'https://worldchain-sepolia.g.alchemy.com/public',
    blockExplorer: 'https://worldchain-sepolia.explorer.alchemy.com',
  },
  MAINNET: {
    chainId: 480,
    name: 'World Chain',
    rpcUrl: 'https://worldchain-mainnet.g.alchemy.com/public',
    blockExplorer: 'https://worldscan.org',
  },
} as const;

// Current network (switch to MAINNET for production)
export const CURRENT_NETWORK = WORLD_CHAIN_CONFIG.MAINNET;

// Game configuration
export const GAME_CONFIG = {
  REACTION_GAME: {
    DURATION_MS: 5000,
    TARGET_COUNT: 5,
    DIFFICULTY_LEVELS: ['easy', 'medium', 'hard'] as const,
  },
  PRIZE_POOL: {
    BASE_AMOUNT_USD: 100,
    MIN_PRIZE_USD: 1,
    MAX_PRIZE_USD: 1000,
  },
} as const;