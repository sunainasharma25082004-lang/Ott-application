import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { getNetworkState } from '../utils/networkState';

// Cross-platform secure storage
// expo-secure-store does NOT work properly on web (causes "setValuewithAsync is not a function")
// So we fall back to localStorage on web (fine for development)
const isWeb = Platform.OS === 'web';

const secureStorage = {
  setItemAsync: async (key: string, value: string) => {
    if (isWeb) {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  getItemAsync: async (key: string): Promise<string | null> => {
    if (isWeb) {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  deleteItemAsync: async (key: string) => {
    if (isWeb) {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

if (isWeb) {
  console.warn('[API] Running on web → using localStorage for tokens (NOT secure, visible in DevTools). For real auth testing use Android/iOS emulator or device.');
}

// ====================== API BASE URL CONFIG ======================
// This is logged on app start so you can see exactly what URL the app is using.
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Default to live production Render backend so builds work out-of-the-box
  return 'https://talent-hunt-backend-ek9p.onrender.com/api';
};

const API_BASE_URL = getBaseUrl();

console.log(`[API] ========================================`);
console.log(`[API] Using base URL: ${API_BASE_URL}`);
console.log(`[API] Platform detected: ${Platform.OS}`);
if (!process.env.EXPO_PUBLIC_API_URL) {
  console.log(`[API] >>> Running with --tunnel? 10.0.2.2/127.0.0.1 will NOT work through the tunnel.`);
  console.log(`[API] >>> Set EXPO_PUBLIC_API_URL in a root .env file to your PC's LAN IP or a tunneled backend URL, then restart Expo.`);
}
console.log(`[API] >>> ANDROID EMULATOR USERS (Windows): 10.0.2.2 sahi hai (only WITHOUT --tunnel)`);
console.log(`[API]     Backend start karne ke baad emulator ke browser mein ye test karo:`);
console.log(`[API]     ${API_BASE_URL.replace('/api', '')}/api/ping`);
console.log(`[API]     ${API_BASE_URL.replace('/api', '')}/api/status`);
console.log(`[API]     Agar ping nahi aata → Firewall issue ya backend band.`);
console.log(`[API] If you get Network Error:`);
console.log(`[API]   - Make sure backend is running: cd server && npm run dev`);
console.log(`[API]   - Windows Firewall command (Admin PowerShell):`);
console.log(`[API]     New-NetFirewallRule -DisplayName "Node 5000" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow`);
console.log(`[API]   - Test in browser: ${API_BASE_URL.replace('/api', '')}/api/status`);
console.log(`[API] ========================================`);

// ====================== TOKEN MANAGEMENT ======================
const TOKEN_KEY = 'auth_token';

let cachedToken: string | null = null;

export const setAuthToken = async (token: string | null) => {
  cachedToken = token;
  if (token) {
    await secureStorage.setItemAsync(TOKEN_KEY, token);
  } else {
    await secureStorage.deleteItemAsync(TOKEN_KEY);
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  if (cachedToken) return cachedToken;
  try {
    cachedToken = await secureStorage.getItemAsync(TOKEN_KEY);
    return cachedToken;
  } catch {
    return null;
  }
};

export const clearAuthToken = async () => {
  cachedToken = null;
  await secureStorage.deleteItemAsync(TOKEN_KEY);
};

// ====================== CORE FETCH WRAPPER ======================
async function request<T = any>(
  method: string,
  endpoint: string,
  data?: any
): Promise<T> {
  const { isOnline } = getNetworkState();
  const isAuthEndpoint = endpoint.includes('/auth/');
  if (!isOnline && !isAuthEndpoint) {
    throw new Error('You are offline. Check your network connection.');
  }

  const token = await getAuthToken();

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;

  const headers: Record<string, string> = {};
  // For multipart uploads, let fetch set the Content-Type (incl. boundary) itself
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = isFormData ? data : JSON.stringify(data);
  }

  try {
    // Add timeout to prevent indefinite "loading" / stuck states on slow/hanging connections (e.g. emulator + Atlas latency)
    const TIMEOUT_MS = 20000;
    const fetchPromise = fetch(url, config);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout after ' + TIMEOUT_MS + 'ms')), TIMEOUT_MS)
    );
    const response = await Promise.race([fetchPromise, timeoutPromise]);

    // Try to parse JSON, fall back to text
    let result: any;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      result = await response.json();
    } else {
      result = await response.text();
    }

    if (!response.ok) {
      const errorMessage = result?.message || result || `HTTP ${response.status}`;
      const error = new Error(errorMessage);
      // @ts-ignore
      error.status = response.status;
      // @ts-ignore
      error.response = { data: result };
      // Preserve detailed validation errors (422)
      // @ts-ignore
      error.errors = result?.errors || null;

      // Auto-clear token on 401 (expired/invalid auth) so user is forced to re-login next time / in UI
      if (response.status === 401) {
        await clearAuthToken().catch(() => {});
      }

      throw error;
    }

    return result as T;
  } catch (err: any) {
    const isNetworkError =
      err.message === 'Network request failed' || // RN fetch
      err.message.includes('Network Error') ||
      err.message.includes('fetch failed') ||
      err.message.includes('Request timeout') ||
      err.message.includes('timeout');

    if (isNetworkError) {
      const friendlyMessage =
        `Network Error: Cannot reach backend at ${url}.\n\n` +
        `Fixes to try (Android Emulator on Windows):\n` +
        `1. Backend chal raha hai? ALAG terminal mein run karo:\n   cd server\n   npm run dev\n   (Wait for "Server listening on 0.0.0.0:5000")\n\n` +
        `2. Emulator browser mein test karo (important!):\n   http://10.0.2.2:5000/api/ping\n   Ya: http://10.0.2.2:5000/api/status\n   Agar yahan bhi nahi khulta → connection block hai.\n\n` +
        `3. Windows Firewall block kar raha hoga (sabse common):\n   PowerShell **Administrator** mein ye command run karo:\n   New-NetFirewallRule -DisplayName "Node 5000" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow\n\n` +
        `4. App restart karo (Expo mein 'r' dabaao ya reload).\n\n` +
        `5. Agar physical phone use kar rahe ho → ipconfig se apna WiFi IPv4 lo aur src/lib/api.ts mein hardcode kar do.\n\n` +
        `Note: Register ke baad OTP backend terminal mein print hota hai (dev).`;

      console.error('[API Network Error]', url);
      const networkErr = new Error(friendlyMessage);
      // @ts-ignore
      networkErr.isNetworkError = true;
      throw networkErr;
    }

    // Re-throw other errors (auth errors, validation, etc.)
    throw err;
  }
}

// ====================== PUBLIC API CLIENT ======================
export const apiClient = {
  get: <T = any>(endpoint: string) => request<T>('GET', endpoint),
  post: <T = any>(endpoint: string, data?: any) => request<T>('POST', endpoint, data),
  put: <T = any>(endpoint: string, data?: any) => request<T>('PUT', endpoint, data),
  delete: <T = any>(endpoint: string) => request<T>('DELETE', endpoint),
};

// ====================== AUTH HELPERS ======================
export const fetchMe = async () => {
  return apiClient.get('/auth/me');
};

export const logoutUser = async () => {
  try {
    // Call backend to invalidate refresh token (best effort)
    await apiClient.post('/auth/logout');
  } catch (e) {
    // Ignore errors (e.g. already logged out / network)
  } finally {
    await clearAuthToken();
  }
};

// ====================== SELECTED PROFILE PERSISTENCE ======================
const PROFILE_KEY = 'selected_profile';

export const setSelectedProfileStorage = async (profile: any) => {
  if (profile) {
    await secureStorage.setItemAsync(PROFILE_KEY, JSON.stringify(profile));
  } else {
    await secureStorage.deleteItemAsync(PROFILE_KEY);
  }
};

export const getSelectedProfileStorage = async (): Promise<any | null> => {
  try {
    const val = await secureStorage.getItemAsync(PROFILE_KEY);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
};

export const clearSelectedProfileStorage = async () => {
  await secureStorage.deleteItemAsync(PROFILE_KEY);
};

export default apiClient;
export { API_BASE_URL };