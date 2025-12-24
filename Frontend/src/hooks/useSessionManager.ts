import { useState, useEffect, useCallback } from 'react';

interface SessionData {
  token: string;
  expiresAt: number;
  lastActivity: number;
}

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1 minute
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry

export const useSessionManager = () => {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number>(0);

  // Initialize session from localStorage
  useEffect(() => {
    const storedSession = localStorage.getItem('cinepal-session');
    if (storedSession) {
      try {
        const session: SessionData = JSON.parse(storedSession);
        const now = Date.now();
        
        // Check if session is still valid
        if (session.expiresAt > now) {
          setSessionData(session);
          updateActivity();
        } else {
          clearSession();
        }
      } catch (error) {
        console.error('Invalid session data:', error);
        clearSession();
      }
    }
  }, []);

  // Activity monitoring
  useEffect(() => {
    if (!sessionData) return;

    const checkActivity = () => {
      const now = Date.now();
      const timeSinceActivity = now - sessionData.lastActivity;
      const timeUntilExpiry = sessionData.expiresAt - now;

      setTimeUntilExpiry(timeUntilExpiry);

      // Show warning 5 minutes before expiry
      if (timeUntilExpiry <= WARNING_TIME && timeUntilExpiry > 0) {
        setShowExpiryWarning(true);
      } else {
        setShowExpiryWarning(false);
      }

      // Auto-logout if session expired
      if (timeUntilExpiry <= 0) {
        clearSession();
        return;
      }

      // Auto-logout if inactive for session duration
      if (timeSinceActivity >= SESSION_DURATION) {
        clearSession();
        return;
      }
    };

    const interval = setInterval(checkActivity, ACTIVITY_CHECK_INTERVAL);
    checkActivity(); // Initial check

    return () => clearInterval(interval);
  }, [sessionData]);

  const createSession = useCallback((token: string) => {
    const now = Date.now();
    const session: SessionData = {
      token,
      expiresAt: now + SESSION_DURATION,
      lastActivity: now,
    };

    setSessionData(session);
    localStorage.setItem('cinepal-session', JSON.stringify(session));
    setShowExpiryWarning(false);
  }, []);

  const updateActivity = useCallback(() => {
    if (!sessionData) return;

    const now = Date.now();
    // Prevent unnecessary updates if lastActivity is already recent
    if (now - sessionData.lastActivity < ACTIVITY_CHECK_INTERVAL / 2) return;

    const updatedSession: SessionData = {
      ...sessionData,
      lastActivity: now,
      expiresAt: now + SESSION_DURATION, // Extend session on activity
    };

    setSessionData(updatedSession);
    localStorage.setItem('cinepal-session', JSON.stringify(updatedSession));
  }, [sessionData]);

  const clearSession = useCallback(() => {
    setSessionData(null);
    setShowExpiryWarning(false);
    setTimeUntilExpiry(0);
    localStorage.removeItem('cinepal-session');
    localStorage.removeItem('cinepal-token');
    localStorage.removeItem('cinepal-user');
  }, []);

  const extendSession = useCallback(() => {
    if (!sessionData) return;

    const now = Date.now();
    const extendedSession: SessionData = {
      ...sessionData,
      expiresAt: now + SESSION_DURATION,
      lastActivity: now,
    };

    setSessionData(extendedSession);
    localStorage.setItem('cinepal-session', JSON.stringify(extendedSession));
    setShowExpiryWarning(false);
  }, [sessionData]);

  const isSessionValid = useCallback(() => {
    if (!sessionData) return false;
    
    const now = Date.now();
    return sessionData.expiresAt > now && (now - sessionData.lastActivity) < SESSION_DURATION;
  }, [sessionData]);

  const getTimeUntilExpiry = useCallback(() => {
    if (!sessionData) return 0;
    return Math.max(0, sessionData.expiresAt - Date.now());
  }, [sessionData]);

  const formatTimeRemaining = useCallback((ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Modify useEffect for user activity tracking
  useEffect(() => {
    if (!sessionData) return;

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      updateActivity();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [sessionData, updateActivity]);

  return {
    sessionData,
    isSessionValid: isSessionValid(),
    showExpiryWarning,
    timeUntilExpiry,
    createSession,
    updateActivity,
    clearSession,
    extendSession,
    getTimeUntilExpiry,
    formatTimeRemaining,
  };
};