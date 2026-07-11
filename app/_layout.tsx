import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { NetworkProvider } from '../src/context/NetworkContext';
import { DownloadsProvider } from '../src/context/DownloadsContext';
import OfflineBanner from '../src/components/OfflineBanner';
import { ThemeProvider, DarkTheme } from '@react-navigation/native';

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#050505', // Deep black to prevent white flashing during screen transitions
  },
};

export default function RootLayout() {
  return (
    <NetworkProvider>
      <DownloadsProvider>
        <AuthProvider>
          <ThemeProvider value={CustomDarkTheme}>
            <OfflineBanner />
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </DownloadsProvider>
    </NetworkProvider>
  );
}