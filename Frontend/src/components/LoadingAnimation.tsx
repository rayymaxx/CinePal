import React from 'react';

interface LoadingAnimationProps {
  type?: 'popcorn' | 'film-reel' | 'ticket' | 'clapperboard' | 'projector';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  type = 'popcorn',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-24 h-24'
  };

  const renderAnimation = () => {
    switch (type) {
      case 'popcorn':
        return (
          <div className={`popcorn-loading ${sizeClasses[size]} ${className}`}>
            <div className="text-4xl">🍿</div>
          </div>
        );
      
      case 'film-reel':
        return (
          <div className={`film-reel-loading ${sizeClasses[size]} ${className}`}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
              <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
              <circle cx="16" cy="8" r="1.5" fill="currentColor"/>
              <circle cx="8" cy="16" r="1.5" fill="currentColor"/>
              <circle cx="16" cy="16" r="1.5" fill="currentColor"/>
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
            </svg>
          </div>
        );
      
      case 'ticket':
        return (
          <div className={`ticket-loading ${sizeClasses[size]} ${className}`}>
            <div className="text-4xl">🎫</div>
          </div>
        );
      
      case 'clapperboard':
        return (
          <div className={`clapperboard-loading ${sizeClasses[size]} ${className}`}>
            <div className="text-4xl">🎬</div>
          </div>
        );
      
      case 'projector':
        return (
          <div className={`relative ${sizeClasses[size]} ${className}`}>
            <div className="text-4xl">📽️</div>
            <div className="projector-beam absolute top-1/2 left-full w-8 h-1 bg-current opacity-50"></div>
          </div>
        );
      
      default:
        return (
          <div className={`popcorn-loading ${sizeClasses[size]} ${className}`}>
            <div className="text-4xl">🍿</div>
          </div>
        );
    }
  };

  return (
    <div className="flex items-center justify-center">
      {renderAnimation()}
    </div>
  );
};