import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const loadingAnimations = [
  { type: 'popcorn', emoji: '🍿', size: 'w-8 h-8' },
  { type: 'film', emoji: '🎬', size: 'w-10 h-10' },
  { type: 'ticket', emoji: '🎫', size: 'w-6 h-6' },
  { type: 'camera', emoji: '📽️', size: 'w-12 h-12' },
  { type: 'reel', emoji: '🎞️', size: 'w-8 h-8' },
  { type: 'star', emoji: '⭐', size: 'w-6 h-6' },
  { type: 'clapper', emoji: '🎭', size: 'w-10 h-10' },
  { type: 'screen', emoji: '🖥️', size: 'w-8 h-8' },
];

export const LoadingPage: React.FC = () => {
  const { currentTheme } = useTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Glassmorphism Background */}
      <div 
        className="absolute inset-0 backdrop-blur-3xl"
        style={{ 
          background: `linear-gradient(135deg, ${currentTheme.primary}15, ${currentTheme.secondary}10, ${currentTheme.accent}05)`
        }}
      />
      
      {/* Floating Animations */}
      {loadingAnimations.map((item, index) => (
        <motion.div
          key={index}
          className={`absolute ${item.size} flex items-center justify-center text-2xl`}
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0,
            scale: 0
          }}
          animate={{
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth
            ],
            y: [
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight
            ],
            opacity: [0, 0.8, 0.4, 0.8, 0],
            scale: [0, 1.2, 0.8, 1.2, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* Central Loading Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center p-12 rounded-3xl glass border border-white/20 shadow-2xl max-w-md mx-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: currentTheme.primary }}
        >
          <span className="text-4xl">🎬</span>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-4"
          style={{ color: currentTheme.text }}
        >
          CinePal
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg opacity-70 mb-6"
          style={{ color: currentTheme.text }}
        >
          Loading your movie experience...
        </motion.p>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-1 rounded-full mx-auto"
          style={{ backgroundColor: currentTheme.primary }}
        />
      </motion.div>
    </div>
  );
};