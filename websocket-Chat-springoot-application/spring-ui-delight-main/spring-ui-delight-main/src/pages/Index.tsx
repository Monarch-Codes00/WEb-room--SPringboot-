import { LoginScreen } from '@/components/LoginScreen';
import { Dashboard } from '@/components/Dashboard';
import { WebSocketProvider } from '@/context/WebSocketContext';
import { useAuth } from '@/context/AuthContext';

function AppContent() {
  const { token, user } = useAuth();

  if (!token || !user) {
    return <LoginScreen />;
  }

  return (
    <WebSocketProvider>
      <Dashboard />
    </WebSocketProvider>
  );
}

const Index = () => {
  return <AppContent />;
};

export default Index;
