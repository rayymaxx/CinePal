import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to CinePal! 🎬',
    description: 'Your AI-powered movie companion. Let me show you around!',
    target: 'body',
    position: 'bottom',
  },
  {
    id: 'theme-selector',
    title: 'Choose Your Style',
    description: 'Switch between 8 beautiful themes to customize your experience.',
    target: '[data-tour="theme-selector"]',
    position: 'left',
  },
  {
    id: 'chat-button',
    title: 'Start Chatting',
    description: 'Get personalized movie recommendations by chatting with our AI.',
    target: '[data-tour="chat-button"]',
    position: 'bottom',
  },
  {
    id: 'filters',
    title: 'Filter & Browse',
    description: 'Use filters to find movies by genre, year, rating, and more.',
    target: '[data-tour="filters"]',
    position: 'bottom',
  },
  {
    id: 'watchlist',
    title: 'Save for Later',
    description: 'Add movies to your watchlist by clicking the heart icon.',
    target: '[data-tour="watchlist"]',
    position: 'top',
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Press Ctrl+/ to see all available keyboard shortcuts for faster navigation.',
    target: 'body',
    position: 'bottom',
  },
];

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const { currentTheme } = useTheme();

  const currentTourStep = tourSteps[currentStep];

  useEffect(() => {
    if (isOpen && currentTourStep) {
      const element = document.querySelector(currentTourStep.target) as HTMLElement;
      setTargetElement(element);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight the element
        element.style.position = 'relative';
        element.style.zIndex = '1000';
        element.style.boxShadow = `0 0 0 4px ${currentTheme.primary}40, 0 0 20px ${currentTheme.primary}60`;
        element.style.borderRadius = '8px';
      }
    }

    return () => {
      if (targetElement) {
        targetElement.style.position = '';
        targetElement.style.zIndex = '';
        targetElement.style.boxShadow = '';
        targetElement.style.borderRadius = '';
      }
    };
  }, [currentStep, isOpen, currentTourStep, currentTheme.primary, targetElement]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getTooltipPosition = () => {
    if (!targetElement) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const rect = targetElement.getBoundingClientRect();
    const tooltipOffset = 20;

    switch (currentTourStep.position) {
      case 'top':
        return {
          top: rect.top - tooltipOffset,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: rect.bottom + tooltipOffset,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          top: rect.top + rect.height / 2,
          left: rect.left - tooltipOffset,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: rect.top + rect.height / 2,
          left: rect.right + tooltipOffset,
          transform: 'translate(0, -50%)',
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* Translucent Glassmorphism Overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 backdrop-blur-sm bg-black/30 border-t border-white/10"
        />

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute glass rounded-xl p-6 max-w-sm shadow-2xl"
          style={{
            ...getTooltipPosition(),
            borderColor: currentTheme.primary,
            borderWidth: '2px',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold" style={{ color: currentTheme.text }}>
              {currentTourStep.title}
            </h3>
            <button
              onClick={onSkip}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={16} style={{ color: currentTheme.text }} />
            </button>
          </div>

          {/* Content */}
          <p className="text-sm mb-6 opacity-80" style={{ color: currentTheme.text }}>
            {currentTourStep.description}
          </p>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-2" style={{ color: currentTheme.text }}>
              <span>Step {currentStep + 1} of {tourSteps.length}</span>
              <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                className="h-2 rounded-full transition-all duration-300"
                style={{ backgroundColor: currentTheme.primary }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={prevStep}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg glass hover:glass-dark transition-all text-sm"
                  style={{ color: currentTheme.text }}
                >
                  <ArrowLeft size={14} />
                  Back
                </motion.button>
              )}
              
              <button
                onClick={onSkip}
                className="px-3 py-2 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors opacity-70"
                style={{ color: currentTheme.text }}
              >
                Skip Tour
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextStep}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all text-sm"
              style={{ backgroundColor: currentTheme.primary }}
            >
              {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
              {currentStep < tourSteps.length - 1 && <ArrowRight size={14} />}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Hook to manage onboarding state
export const useOnboarding = () => {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('cinepal-onboarding-complete');
    if (!hasSeenTour) {
      // Delay showing tour to let the page load
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeTour = () => {
    setShowTour(false);
    localStorage.setItem('cinepal-onboarding-complete', 'true');
  };

  const skipTour = () => {
    setShowTour(false);
    localStorage.setItem('cinepal-onboarding-complete', 'true');
  };

  const startTour = () => {
    setShowTour(true);
  };

  return {
    showTour,
    completeTour,
    skipTour,
    startTour,
  };
};