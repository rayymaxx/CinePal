import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, RefreshCw, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SessionExpiryWarningProps {
  isVisible: boolean;
  timeRemaining: number;
  onExtendSession: () => void;
  onLogout: () => void;
  formatTime: (ms: number) => string;
}

export const SessionExpiryWarning: React.FC<SessionExpiryWarningProps> = ({
  isVisible,
  timeRemaining,
  onExtendSession,
  onLogout,
  formatTime,
}) => {
  const { currentTheme } = useTheme();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <div className="glass rounded-xl p-6 shadow-2xl border-2 border-yellow-400">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center"
                >
                  <Clock size={20} className="text-yellow-900" />
                </motion.div>
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2" style={{ color: currentTheme.text }}>
                  Session Expiring Soon
                </h3>
                
                <p className="text-sm opacity-80 mb-4" style={{ color: currentTheme.text }}>
                  Your session will expire in{' '}
                  <span className="font-mono font-bold text-yellow-600">
                    {formatTime(timeRemaining)}
                  </span>
                </p>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onExtendSession}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium text-sm hover:bg-green-600 transition-colors"
                  >
                    <RefreshCw size={16} />
                    Extend Session
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: `${Math.max(0, (timeRemaining / (5 * 60 * 1000)) * 100)}%` }}
                  className="h-2 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all duration-1000"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};