import { Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';


export default function AdminIndex() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (user?.role === 'admin') return <Redirect href="/admin/dashboard" />;
  return <Redirect href="/admin-login" />;
}
