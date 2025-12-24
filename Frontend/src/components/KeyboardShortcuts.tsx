import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTheme } from '../contexts/ThemeContext';

interface KeyboardShortcut {
  key: string;
  description: string;
  category: string;
}

const shortcuts: KeyboardShortcut[] = [
  { key: 'Ctrl+K', description: 'Open search', category: 'Navigation' },
  { key: 'Ctrl+/', description: 'Show keyboard shortcuts', category: 'Help' },
  { key: 'Ctrl+T', description: 'Toggle theme selector', category: 'Appearance' },
  { key: 'Ctrl+N', description: 'New chat session', category: 'Chat' },
  { key: 'Ctrl+E', description: 'Export chat history', category: 'Chat' },
  { key: 'Ctrl+F', description: 'Toggle filters', category: 'Movies' },
  { key: 'Ctrl+W', description: 'Toggle watchlist', category: 'Movies' },
  { key: 'Escape', description: 'Close modals/overlays', category: 'General' },
  { key: 'Enter', description: 'Send message (in chat)', category: 'Chat' },
  { key: 'Ctrl+Enter', description: 'Send message with new line', category: 'Chat' },
];

interface KeyboardShortcutsProps {
  onSearch?: () => void;
  onNewChat?: () => void;
  onExportChat?: () => void;
  onToggleFilters?: () => void;
  onToggleWatchlist?: () => void;
  onToggleTheme?: () => void;
}

export const useKeyboardShortcuts = ({
  onSearch,
  onNewChat,
  onExportChat,
  onToggleFilters,
  onToggleWatchlist,
  onToggleTheme,
}: KeyboardShortcutsProps) => {
  const [showHelp, setShowHelp] = useState(false);

  useHotkeys('ctrl+k', (e) => {
    e.preventDefault();
    onSearch?.();
  });

  useHotkeys('ctrl+/', (e) => {
    e.preventDefault();
    setShowHelp(true);
  });

  useHotkeys('ctrl+t', (e) => {
    e.preventDefault();
    onToggleTheme?.();
  });

  useHotkeys('ctrl+n', (e) => {
    e.preventDefault();
    onNewChat?.();
  });

  useHotkeys('ctrl+e', (e) => {
    e.preventDefault();
    onExportChat?.();
  });

  useHotkeys('ctrl+f', (e) => {
    e.preventDefault();
    onToggleFilters?.();
  });

  useHotkeys('ctrl+w', (e) => {
    e.preventDefault();
    onToggleWatchlist?.();
  });

  useHotkeys('escape', () => {
    setShowHelp(false);
  });

  return { showHelp, setShowHelp };
};

interface KeyboardHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardHelpModal: React.FC<KeyboardHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentTheme } = useTheme();

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="glass rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Keyboard size={24} style={{ color: currentTheme.primary }} />
                <h2 className="text-2xl font-bold" style={{ color: currentTheme.text }}>
                  Keyboard Shortcuts
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} style={{ color: currentTheme.text }} />
              </button>
            </div>

            <div className="space-y-6">
              {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: currentTheme.primary }}>
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut) => (
                      <div key={shortcut.key} className="flex items-center justify-between py-2">
                        <span className="text-sm" style={{ color: currentTheme.text }}>
                          {shortcut.description}
                        </span>
                        <kbd
                          className="px-3 py-1 text-xs font-mono rounded border"
                          style={{
                            backgroundColor: currentTheme.background,
                            borderColor: currentTheme.primary,
                            color: currentTheme.text,
                          }}
                        >
                          {shortcut.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t" style={{ borderColor: currentTheme.primary }}>
              <p className="text-sm opacity-70" style={{ color: currentTheme.text }}>
                Press <kbd className="px-2 py-1 text-xs font-mono rounded border">Escape</kbd> to close this dialog
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};