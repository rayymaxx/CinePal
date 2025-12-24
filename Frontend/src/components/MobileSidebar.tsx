import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, MessageCircle, Settings, LogOut, Film } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export const MobileSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/chat', label: 'Chat', icon: MessageCircle },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 rounded-full shadow-lg transition-all duration-300"
          style={{
            backgroundColor: currentTheme.primary,
            color: 'white',
          }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="lg:hidden fixed right-0 top-0 bottom-0 w-64 z-40 glass border-l border-white/10 shadow-xl overflow-y-auto"
            style={{
              background: currentTheme.background,
            }}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  <Film size={20} color="white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg" style={{ color: currentTheme.text }}>
                    CinePal
                  </h1>
                  <p className="text-xs opacity-60" style={{ color: currentTheme.text }}>
                    Menu
                  </p>
                </div>
              </div>

              {/* User Info */}
              {user && (
                <div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: `${currentTheme.primary}15`,
                  }}
                >
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: currentTheme.text }}
                  >
                    {user.user_name}
                  </p>
                </div>
              )}
            </div>

            {/* Navigation Items */}
            <nav className="p-4 space-y-2">
              {navigationItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300"
                  style={{
                    backgroundColor: isActive(path)
                      ? `${currentTheme.primary}30`
                      : 'transparent',
                    color: isActive(path) ? currentTheme.primary : currentTheme.text,
                  }}
                >
                  <Icon size={20} />
                  <span className="font-medium">{label}</span>
                  {isActive(path) && (
                    <div
                      className="ml-auto w-2 h-2 rounded-full"
                      style={{ backgroundColor: currentTheme.primary }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Logout Button */}
            <div className="border-t border-white/10 p-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300"
                style={{
                  backgroundColor: `${currentTheme.primary}20`,
                  color: currentTheme.primary,
                }}
              >
                <LogOut size={18} />
                Logout
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
