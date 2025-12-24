import { useState, useEffect } from 'react';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        console.log('Back online!');
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      console.log('Gone offline!');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
};

export const cacheManager = {
  saveChatMessages: (sessionId: string, messages: any[]) => {
    try {
      localStorage.setItem(`cinepal-chat-${sessionId}`, JSON.stringify(messages));
    } catch (error) {
      console.warn('Failed to cache chat messages:', error);
    }
  },

  getChatMessages: (sessionId: string) => {
    try {
      const cached = localStorage.getItem(`cinepal-chat-${sessionId}`);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.warn('Failed to retrieve cached chat messages:', error);
      return [];
    }
  },

  saveMovieData: (movies: any[]) => {
    try {
      localStorage.setItem('cinepal-movies-cache', JSON.stringify({
        data: movies,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.warn('Failed to cache movie data:', error);
    }
  },

  getMovieData: () => {
    try {
      const cached = localStorage.getItem('cinepal-movies-cache');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 3600000) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.warn('Failed to retrieve cached movie data:', error);
      return null;
    }
  },

  saveUserPreferences: (preferences: any) => {
    try {
      localStorage.setItem('cinepal-preferences-cache', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to cache user preferences:', error);
    }
  },

  getUserPreferences: () => {
    try {
      const cached = localStorage.getItem('cinepal-preferences-cache');
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Failed to retrieve cached user preferences:', error);
      return null;
    }
  },

  clearCache: () => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('cinepal-'));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  },
};

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};