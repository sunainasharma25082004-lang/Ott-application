import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkState {
  isOnline: boolean;
  connectionType: string;
}

let currentState: NetworkState = {
  isOnline: true,
  connectionType: 'unknown',
};

let listeners: Array<(state: NetworkState) => void> = [];

const updateState = (newState: NetInfoState) => {
  currentState = {
    isOnline: newState.isConnected ?? true,
    connectionType: newState.type || 'unknown',
  };
  listeners.forEach(l => l(currentState));
};

let initialized = false;

export const initializeNetworkListener = () => {
  if (initialized) return;
  initialized = true;
  NetInfo.fetch().then(updateState);
  NetInfo.addEventListener(updateState);
};

export const getNetworkState = (): NetworkState => {
  if (!initialized) initializeNetworkListener();
  return { ...currentState };
};

export const subscribeToNetworkState = (listener: (state: NetworkState) => void) => {
  if (!initialized) initializeNetworkListener();
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

export const isOnline = (): boolean => {
  return getNetworkState().isOnline;
};
