import { Redirect } from 'expo-router';

export default function OnboardingStub() {
  return <Redirect href="/(auth)/login" />;
}
