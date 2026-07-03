import { Redirect } from 'expo-router';

export default function SignupStub() {
  // The main auth experience (Sign In + Register + OTP) lives in login.tsx
  return <Redirect href="/(auth)/login" />;
}
