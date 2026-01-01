import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, ThumbsUp, Film, Download, MoreHorizontal } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { chatService } from '../services/chatService';
import { ChatMessage, ChatRequest } from '../types';
import { LoadingAnimation } from './LoadingAnimation';
import { useNotifications } from './NotificationSystem';
import { useChatStore } from '../store';

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
  const { sessions, addMessage, updateSessionName } = useChatStore();

  // Load messages from store when session changes
  useEffect(() => {
    if (sessionId && sessions[sessionId] && sessions[sessionId].messages) {
      setMessages(sessions[sessionId].messages);
    } else {
      setMessages([]);
    }
  }, [sessionId, sessions]);

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
    addMessage(currentSessionId || '', userMessage);
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
      addMessage(currentSessionId || response.session_id, aiMessage);
      
      // Update session name if this is the first AI response
      if ((messages || []).length === 1 && currentSessionId) {
        const sessionName = response.response.split('.')[0].slice(0, 50) + (response.response.length > 50 ? '...' : '');
        updateSessionName(currentSessionId, sessionName);
      }
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
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between p-5 glass border-b flex-shrink-0"
        style={{ borderColor: `${currentTheme.primary}40` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ background: `${currentTheme.primary}20` }}
          >
            <Film size={24} style={{ color: currentTheme.primary }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: currentTheme.text }}>
              CinePal Chat
            </h2>
            <p className="text-xs opacity-60" style={{ color: currentTheme.text }}>
              Your AI movie recommendation assistant
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportChat}
          className="p-3 rounded-full transition-all"
          style={{
            background: `${currentTheme.primary}20`,
            color: currentTheme.primary,
          }}
          title="Export Chat"
        >
          <Download size={20} />
        </motion.button>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <AnimatePresence>
          {(messages || []).map((message) => (
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
      {(messages || []).length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 border-t flex-shrink-0"
          style={{ borderColor: `${currentTheme.primary}40` }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">💡</span>
            <p className="text-sm font-semibold opacity-80" style={{ color: currentTheme.text }}>
              Quick suggestions:
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickReplies.map((reply, index) => (
              <motion.button
                key={reply}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage(reply)}
                className="px-4 py-3 text-sm font-medium rounded-xl glass transition-all text-left hover:shadow-lg"
                style={{
                  color: currentTheme.text,
                  background: `${currentTheme.primary}10`,
                  border: `1px solid ${currentTheme.primary}30`,
                }}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">🎬</span>
                  {reply}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-6 border-t flex-shrink-0"
        style={{ borderColor: `${currentTheme.primary}40` }}
      >
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputValue)}
              placeholder="Ask me anything about movies or shows..."
              className="w-full px-5 py-4 rounded-xl glass border-0 focus:ring-2 transition-all text-base"
              style={{ 
                color: currentTheme.text,
                '--tw-ring-color': currentTheme.primary,
                '--tw-ring-offset-color': currentTheme.background,
              } as React.CSSProperties}
              disabled={loading}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage(inputValue)}
            disabled={loading || !inputValue.trim()}
            className="px-5 py-4 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
            style={{ 
              backgroundColor: currentTheme.primary,
              opacity: loading || !inputValue.trim() ? 0.5 : 1,
            }}
          >
            <Send size={20} />
            <span className="hidden sm:inline">Send</span>
          </motion.button>
        </div>
        <p className="text-xs opacity-50 mt-2" style={{ color: currentTheme.text }}>
          Press Enter or click Send to submit
        </p>
      </motion.div>
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

  // Format AI response with markdown support and better typography
  const formatAIResponse = (text: string) => {
    if (message.isUser) return text;

    // Split text into paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim());

    // Helper function to parse markdown formatting
    const parseMarkdown = (str: string): (string | React.ReactNode)[] | string => {
      const parts: (string | React.ReactNode)[] = [];
      let lastIndex = 0;

      // Match bold (**text**), italic (*text*), and code (`text`)
      const markdownRegex = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/g;
      let match;

      while ((match = markdownRegex.exec(str)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          parts.push(str.substring(lastIndex, match.index));
        }

        // Add the formatted match
        if (match[1]) {
          // Bold text
          parts.push(
            <span key={`bold-${match.index}`} style={{ color: currentTheme.primary }} className="font-bold">
              {match[1]}
            </span>
          );
        } else if (match[2]) {
          // Italic text
          parts.push(
            <span key={`italic-${match.index}`} className="italic opacity-90">
              {match[2]}
            </span>
          );
        } else if (match[3]) {
          // Code text
          parts.push(
            <code key={`code-${match.index}`} className="bg-black/30 px-2 py-1 rounded font-mono text-sm">
              {match[3]}
            </code>
          );
        }

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < str.length) {
        parts.push(str.substring(lastIndex));
      }

      return parts.length > 0 ? parts : str;
    };

    return (
      <div className="space-y-4">
        {paragraphs.map((paragraph, idx) => {
          // Check if paragraph is a numbered list
          if (/^\d+\./.test(paragraph)) {
            return (
              <div key={idx} className="space-y-2 ml-1">
                {paragraph.split('\n').map((line, lineIdx) => {
                  const match = line.match(/^(\d+)\.\s*(.+)/);
                  if (!match) return null;
                  const [, num, content] = match;

                  return (
                    <div key={lineIdx} className="flex gap-4 items-start">
                      <div
                        className="flex items-center justify-center w-7 h-7 rounded-lg font-bold flex-shrink-0 text-sm"
                        style={{
                          background: `${currentTheme.primary}30`,
                          color: currentTheme.primary,
                          border: `1px solid ${currentTheme.primary}50`,
                        }}
                      >
                        {num}
                      </div>
                      <div style={{ color: currentTheme.text }} className="leading-relaxed flex-1 pt-0.5">
                        {parseMarkdown(content)}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }

          // Check if paragraph is a bullet list
          if (paragraph.startsWith('•') || paragraph.startsWith('-')) {
            return (
              <div key={idx} className="space-y-2 ml-1">
                {paragraph.split('\n').map((line, lineIdx) => {
                  const cleanLine = line.replace(/^[•\-]\s*/, '').trim();
                  return (
                    <div key={lineIdx} className="flex gap-3 items-start">
                      <span
                        className="flex-shrink-0 text-xl leading-tight pt-1"
                        style={{ color: currentTheme.primary }}
                      >
                        •
                      </span>
                      <div style={{ color: currentTheme.text }} className="leading-relaxed flex-1">
                        {parseMarkdown(cleanLine)}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }

          // Check if it's a heading (ends with :)
          if (paragraph.trim().endsWith(':')) {
            return (
              <h3
                key={idx}
                style={{ color: currentTheme.primary }}
                className="text-lg font-bold mt-5 mb-3 flex items-center gap-2 pt-2"
              >
                <Film size={18} />
                {paragraph.replace(/:$/, '')}
              </h3>
            );
          }

          // Regular paragraph
          return (
            <p
              key={idx}
              style={{ color: currentTheme.text }}
              className="leading-relaxed text-base whitespace-pre-wrap"
            >
              {parseMarkdown(paragraph)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[80%] ${message.isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`p-5 rounded-2xl ${message.isUser ? 'glass-dark' : 'glass'} relative group`}
        >
          {/* Main Message with Enhanced Formatting */}
          <div className="text-base leading-relaxed">
            {message.isUser ? (
              <p style={{ color: currentTheme.text }}>{message.message}</p>
            ) : (
              formatAIResponse(message.message)
            )}
          </div>

          {/* Suggested Shows Section */}
          {message.suggested_shows && message.suggested_shows.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 pt-4 border-t"
              style={{ borderColor: `${currentTheme.primary}40` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Film size={16} style={{ color: currentTheme.primary }} />
                <p className="text-sm font-semibold" style={{ color: currentTheme.primary }}>
                  Suggested Shows
                </p>
              </div>
              <div className="space-y-2">
                {message.suggested_shows.map((show, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="px-4 py-3 rounded-xl backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg"
                    style={{
                      background: `${currentTheme.primary}15`,
                      border: `1px solid ${currentTheme.primary}30`,
                      color: currentTheme.text,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎬</span>
                      <span className="font-medium text-sm">{show}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {message.reactions.map((reaction, index) => (
                <motion.span
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-lg hover:scale-125 transition-transform cursor-pointer"
                >
                  {reaction}
                </motion.span>
              ))}
            </div>
          )}

          {/* Reaction Button */}
          {!message.isUser && (
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowReactions(!showReactions)}
                  className="p-2 rounded-full transition-all"
                  style={{
                    background: `${currentTheme.primary}20`,
                    color: currentTheme.primary,
                  }}
                >
                  <MoreHorizontal size={16} />
                </motion.button>

                {showReactions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute top-full right-0 mt-2 p-3 glass rounded-xl flex gap-2 z-10 shadow-lg"
                  >
                    {reactions.map((reaction) => (
                      <motion.button
                        key={reaction}
                        whileHover={{ scale: 1.3, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          onAddReaction(message.id, reaction);
                          setShowReactions(false);
                        }}
                        className="text-lg cursor-pointer transition-transform"
                      >
                        {reaction}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="text-xs opacity-50 mt-2 px-1" style={{ color: currentTheme.text }}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
};