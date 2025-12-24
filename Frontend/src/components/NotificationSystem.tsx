import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { NotificationProps } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface NotificationSystemProps {
  notifications: NotificationProps[];
  removeNotification: (id: string) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  removeNotification,
}) => {
  const { currentTheme } = useTheme();

  const getIcon = (type: NotificationProps['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-500" />;
      case 'info':
      default:
        return <Info size={20} style={{ color: currentTheme.primary }} />;
    }
  };

  const getBackgroundColor = (type: NotificationProps['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-900/40 border-green-700/50 backdrop-blur-sm';
      case 'error':
        return 'bg-red-900/40 border-red-700/50 backdrop-blur-sm';
      case 'warning':
        return 'bg-yellow-900/40 border-yellow-700/50 backdrop-blur-sm';
      case 'info':
      default:
        return 'bg-slate-800/60 border-slate-700/50 backdrop-blur-sm';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
            icon={getIcon(notification.type)}
            backgroundClass={getBackgroundColor(notification.type)}
            currentTheme={currentTheme}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface NotificationItemProps {
  notification: NotificationProps;
  onRemove: (id: string) => void;
  icon: React.ReactNode;
  backgroundClass: string;
  currentTheme: any;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRemove,
  icon,
  backgroundClass,
  currentTheme,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(notification.id);
    }, notification.duration || 5000);

    return () => clearTimeout(timer);
  }, [notification.id, notification.duration, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      className={`max-w-sm p-4 rounded-lg border shadow-lg ${backgroundClass}`}
    >
      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1">
          <h4 className="font-semibold text-sm" style={{ color: currentTheme.text }}>
            {notification.title}
          </h4>
          <p className="text-sm opacity-80" style={{ color: currentTheme.text }}>
            {notification.message}
          </p>
        </div>
        <button
          onClick={() => onRemove(notification.id)}
          className="text-white/70 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const addNotification = (notification: Omit<NotificationProps, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    addNotification,
    removeNotification,
  };
};