import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ParticleBackground } from './components/ParticleBackground';
import { NotificationSystem } from './components/NotificationSystem';
import { MobileSidebar } from './components/MobileSidebar';
import { KeyboardHelpModal, useKeyboardShortcuts } from './components/KeyboardShortcuts';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { ChatPage } from './pages/ChatPage';
import { Settings } from './pages/Settings';
import { LoadingPage } from './components/LoadingPage';
import { useOffline } from './hooks/useOffline';
import { useAuthStore, useUIStore } from './store';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuthStore();
  const { 
    notifications, 
    showKeyboardHelp,
    setShowKeyboardHelp,
    addNotification,
    removeNotification 
  } = useUIStore();
  const { isOnline, wasOffline } = useOffline();
  
  const { showHelp, setShowHelp } = useKeyboardShortcuts({
    onSearch: () => console.log('Search triggered'),
    onNewChat: () => console.log('New chat triggered'),
    onExportChat: () => console.log('Export chat triggered'),
    onToggleFilters: () => console.log('Toggle filters triggered'),
    onToggleWatchlist: () => console.log('Toggle watchlist triggered'),
    onToggleTheme: () => console.log('Toggle theme triggered'),
  });

  // Show offline/online notifications
  React.useEffect(() => {
    if (!isOnline) {
      addNotification({
        type: 'warning',
        title: 'You\'re offline',
        message: 'Some features may be limited. We\'ll sync when you\'re back online.',
        duration: 8000,
      });
    } else if (wasOffline) {
      addNotification({
        type: 'success',
        title: 'Back online!',
        message: 'All features are now available.',
        duration: 4000,
      });
    }
  }, [isOnline, wasOffline, addNotification]);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      
      <Routes>
        <Route 
          path="/login" 
          element={
            <ProtectedRoute requireAuth={false}>
              <LoginPage />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
        />
        <Route 
          path="*" 
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          } 
        />
      </Routes>

      <NotificationSystem
        notifications={notifications}
        removeNotification={removeNotification}
      />

      {/* Mobile sidebar available on all pages */}
      <MobileSidebar />

      {/* Offline Indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-full shadow-lg">
              <WifiOff size={16} />
              <span className="text-sm font-medium">Offline Mode</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <KeyboardHelpModal
        isOpen={showKeyboardHelp || showHelp}
        onClose={() => {
          setShowKeyboardHelp(false);
          setShowHelp(false);
        }}
      />


    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;