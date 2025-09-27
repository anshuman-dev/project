'use client';

import { useEffect, createContext, useContext } from 'react';
import { MiniKitManager } from '@/lib/minikit';

interface MiniKitContextType {
  miniKit: MiniKitManager;
  isReady: boolean;
}

const MiniKitContext = createContext<MiniKitContextType | null>(null);

export function MiniKitProvider({ children }: { children: React.ReactNode }) {
  const miniKit = MiniKitManager.getInstance();

  useEffect(() => {
    miniKit.initialize();
  }, [miniKit]);

  const value = {
    miniKit,
    isReady: miniKit.isReady(),
  };

  return (
    <MiniKitContext.Provider value={value}>
      {children}
    </MiniKitContext.Provider>
  );
}

export function useMiniKit() {
  const context = useContext(MiniKitContext);
  if (!context) {
    throw new Error('useMiniKit must be used within a MiniKitProvider');
  }
  return context;
}