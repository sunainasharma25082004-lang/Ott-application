import { Redirect } from 'expo-router';

export default function OTPVerificationStub() {
  // OTP is handled inline inside the unified login.tsx screen
  return <Redirect href="/(auth)/login" />;
}
