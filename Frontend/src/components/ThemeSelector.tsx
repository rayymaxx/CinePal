import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 rounded-full glass hover:glass-dark transition-all duration-300"
        style={{ color: currentTheme.primary }}
      >
        <Palette size={20} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="absolute top-full right-0 mt-2 p-4 glass rounded-xl shadow-xl z-50 min-w-[280px]"
          >
            <h3 className="text-lg font-semibold mb-3" style={{ color: currentTheme.text }}>
              Choose Theme
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              {themes.map((theme) => (
                <motion.button
                  key={theme.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setTheme(theme);
                    setIsOpen(false);
                  }}
                  className="relative p-3 rounded-lg border-2 transition-all duration-300 text-left"
                  style={{
                    borderColor: currentTheme.id === theme.id ? theme.primary : 'transparent',
                    backgroundColor: theme.background,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm" style={{ color: theme.text }}>
                        {theme.name}
                      </div>
                      <div className="flex gap-1 mt-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: theme.secondary }}
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: theme.accent }}
                        />
                      </div>
                    </div>
                    
                    {currentTheme.id === theme.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-500"
                      >
                        <Check size={16} />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};