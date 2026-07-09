import React, { createContext, useContext, useEffect, useState } from 'react';
import { subscribeToNetworkState, getNetworkState } from '../utils/networkState';

interface NetworkContextType {
  isOnline: boolean;
  connectionType: string;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NetworkContextType>(getNetworkState());

  useEffect(() => {
    const unsubscribe = subscribeToNetworkState((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  return <NetworkContext.Provider value={state}>{children}</NetworkContext.Provider>;
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
};
