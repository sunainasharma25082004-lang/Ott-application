import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { NetworkProvider } from '../src/context/NetworkContext';
import { DownloadsProvider } from '../src/context/DownloadsContext';
import OfflineBanner from '../src/components/OfflineBanner';

export default function RootLayout() {
  return (
    <NetworkProvider>
      <DownloadsProvider>
        <AuthProvider>
          <OfflineBanner />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </AuthProvider>
      </DownloadsProvider>
    </NetworkProvider>
  );
}