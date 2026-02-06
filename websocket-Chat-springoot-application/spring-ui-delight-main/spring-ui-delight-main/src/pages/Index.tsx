import { LoginScreen } from '@/components/LoginScreen';
import { Dashboard } from '@/components/Dashboard';
import { WebSocketProvider, useWebSocketContext } from '@/context/WebSocketContext';

function AppContent() {
  const { isLoggedIn, login } = useWebSocketContext();

  if (!isLoggedIn) {
    return <LoginScreen onLogin={login} />;
  }

  return <Dashboard />;
}

const Index = () => {
  return (
    <WebSocketProvider>
      <AppContent />
    </WebSocketProvider>
  );
};

export default Index;
