import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, ThumbsUp, Film, Download, MoreHorizontal } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { chatService } from '../services/chatService';
import { ChatMessage, ChatRequest } from '../types';
import { LoadingAnimation } from './LoadingAnimation';
import { useNotifications } from './NotificationSystem';

const quickReplies = [
  "Recommend something funny",
  "I want action movies",
  "Show me horror films",
  "Something romantic",
  "Sci-fi recommendations",
  "Classic movies"
];

const reactions = ['👍', '❤️', '🎬', '🔥', '😍', '🤔'];

interface ChatInterfaceProps {
  sessionId?: string;
  onSessionChange?: (sessionId: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  sessionId,
  onSessionChange
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentTheme } = useTheme();
  const { addNotification } = useNotifications();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const request: ChatRequest = {
        message,
        session_id: currentSessionId,
      };

      const response = await chatService.sendMessage(request);
      
      if (!currentSessionId && response.session_id) {
        setCurrentSessionId(response.session_id);
        onSessionChange?.(response.session_id);
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: response.response,
        timestamp: new Date(),
        isUser: false,
        suggested_shows: response.suggested_shows,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Message failed',
        message: error.response?.data?.detail || 'Failed to send message',
      });
    } finally {
      setLoading(false);
    }
  };

  const addReaction = (messageId: string, reaction: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const hasReaction = reactions.includes(reaction);
        return {
          ...msg,
          reactions: hasReaction 
            ? reactions.filter(r => r !== reaction)
            : [...reactions, reaction]
        };
      }
      return msg;
    }));
  };

  const exportChat = () => {
    const chatData = {
      sessionId: currentSessionId,
      messages: messages.map(msg => ({
        message: msg.message,
        response: msg.response,
        timestamp: msg.timestamp,
        isUser: msg.isUser,
        suggested_shows: msg.suggested_shows,
      })),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cinepal-chat-${currentSessionId || 'session'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: 'Chat exported',
      message: 'Your chat history has been downloaded',
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 glass border-b border-opacity-20">
        <h2 className="text-xl font-semibold" style={{ color: currentTheme.text }}>
          CinePal Chat
        </h2>
        <button
          onClick={exportChat}
          className="p-2 rounded-full hover:bg-opacity-20 hover:bg-gray-500 transition-colors"
          title="Export Chat"
        >
          <Download size={20} style={{ color: currentTheme.primary }} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onAddReaction={addReaction}
              currentTheme={currentTheme}
            />
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="glass rounded-2xl p-4">
              <LoadingAnimation type="film-reel" size="sm" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {messages.length === 0 && (
        <div className="p-4 border-t border-opacity-20">
          <p className="text-sm mb-3 opacity-70" style={{ color: currentTheme.text }}>
            Quick suggestions:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply) => (
              <motion.button
                key={reply}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage(reply)}
                className="px-3 py-2 text-sm rounded-full glass hover:glass-dark transition-all"
                style={{ color: currentTheme.text }}
              >
                {reply}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-opacity-20">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputValue)}
            placeholder="Ask for movie recommendations..."
            className="flex-1 px-4 py-3 rounded-full glass border-0 focus:ring-2 transition-all"
            style={{ 
              color: currentTheme.text,
              '--tw-ring-color': currentTheme.primary 
            } as React.CSSProperties}
            disabled={loading}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage(inputValue)}
            disabled={loading || !inputValue.trim()}
            className="p-3 rounded-full text-white transition-all disabled:opacity-50"
            style={{ backgroundColor: currentTheme.primary }}
          >
            <Send size={20} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  message: ChatMessage;
  onAddReaction: (messageId: string, reaction: string) => void;
  currentTheme: any;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onAddReaction,
  currentTheme,
}) => {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[80%] ${message.isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`p-4 rounded-2xl ${message.isUser ? 'glass-dark' : 'glass'} relative group`}
        >
          <p style={{ color: currentTheme.text }}>{message.message}</p>
          
          {message.suggested_shows && message.suggested_shows.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium opacity-70" style={{ color: currentTheme.text }}>
                Suggested shows:
              </p>
              {message.suggested_shows.map((show, index) => (
                <div
                  key={index}
                  className="px-3 py-2 rounded-lg glass text-sm"
                  style={{ color: currentTheme.text }}
                >
                  {show}
                </div>
              ))}
            </div>
          )}

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex gap-1 mt-2">
              {message.reactions.map((reaction, index) => (
                <span key={index} className="text-sm">
                  {reaction}
                </span>
              ))}
            </div>
          )}

          {/* Reaction Button */}
          {!message.isUser && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="relative">
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <MoreHorizontal size={16} />
                </button>

                {showReactions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-full right-0 mt-1 p-2 glass rounded-lg flex gap-1 z-10"
                  >
                    {reactions.map((reaction) => (
                      <button
                        key={reaction}
                        onClick={() => {
                          onAddReaction(message.id, reaction);
                          setShowReactions(false);
                        }}
                        className="hover:scale-125 transition-transform"
                      >
                        {reaction}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-xs opacity-50 mt-1" style={{ color: currentTheme.text }}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
};