import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Download, Users, MessageSquare, Clock, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { ChatInterface } from '../components/ChatInterface';
import { ThemeSelector } from '../components/ThemeSelector';
import { useChatStore } from '../store';

export const ChatPage: React.FC = () => {
  const { currentSessionId, sessions, setCurrentSession, createNewSession, updateSessionName } = useChatStore();
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCreateNewSession = () => {
    const newSessionId = createNewSession();
    setCurrentSession(newSessionId);
  };

  const handleSessionChange = (sessionId: string) => {
    setCurrentSession(sessionId);
  };

  const sessionList = Object.entries(sessions).map(([id, session]) => ({
    id,
    title: session?.name || 'New Chat',
    lastMessage: (session?.messages && session.messages.length > 0) ? session.messages[session.messages.length - 1].message.slice(0, 50) + '...' : 'No messages yet',
    messageCount: session?.messages?.length || 0,
    lastActivity: new Date(session?.lastActivity || new Date()),
  }));

  return (
    <div className="min-h-screen max-h-screen flex flex-col overflow-hidden" style={{ background: currentTheme?.background || '#0f0f23' }}>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg"
          style={{ background: `${currentTheme.primary}20`, color: currentTheme.primary }}
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: currentTheme.text }}>CinePal Chat</h1>
        <ThemeSelector />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-80 max-w-sm glass border-r border-white/10 flex flex-col backdrop-blur-xl">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-bold" style={{ color: currentTheme.text }}>Chat Sessions</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg"
                  style={{ background: `${currentTheme.primary}20`, color: currentTheme.primary }}
                >
                  <X size={20} />
                </button>
              </div>
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex w-80 glass border-r border-white/10 flex-col backdrop-blur-xl">
          <SidebarContent />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentSessionId ? (
            <ChatInterface
              sessionId={currentSessionId}
              onSessionChange={handleSessionChange}
            />
          ) : (
            <WelcomeScreen />
          )}
        </div>
      </div>
    </div>
  );

  function SidebarContent() {
    return (
      <>
        {/* Header - Desktop Only */}
        <div className="hidden lg:block p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-sm hover:opacity-70 transition-all duration-300 group"
              style={{ color: currentTheme.primary }}
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            <ThemeSelector />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: currentTheme.text }}>
                Chat Sessions
              </h1>
              <p className="text-sm opacity-60" style={{ color: currentTheme.text }}>
                AI Movie Conversations
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateNewSession}
              className="p-3 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300"
              style={{ backgroundColor: currentTheme.primary }}
            >
              <Plus size={20} />
            </motion.button>
          </div>
        </div>

        {/* Mobile New Chat Button */}
        <div className="lg:hidden p-4 border-b border-white/10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              handleCreateNewSession();
              setSidebarOpen(false);
            }}
            className="w-full p-3 rounded-xl text-white font-medium transition-all duration-300 flex items-center justify-center gap-2"
            style={{ backgroundColor: currentTheme.primary }}
          >
            <Plus size={18} />
            New Chat
          </motion.button>
        </div>

        {/* User Info */}
        <div className="p-4 lg:p-6 border-b border-white/10">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 p-3 lg:p-4 rounded-xl glass border border-white/20"
          >
            <div 
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm lg:text-lg shadow-lg"
              style={{ backgroundColor: currentTheme.primary }}
            >
              {user?.user_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm lg:text-base truncate" style={{ color: currentTheme.text }}>
                {user?.user_name}
              </p>
              <div className="flex items-center gap-3 text-xs opacity-70" style={{ color: currentTheme.text }}>
                <div className="flex items-center gap-1">
                  <MessageSquare size={10} />
                  <span>{sessionList.length} chats</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={10} />
                  <span>{user?.preferences.length || 0} preferences</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {sessionList.length === 0 ? (
            <div className="p-4 lg:p-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <div 
                  className="w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50"
                  style={{ backgroundColor: currentTheme.primary + '20' }}
                >
                  <MessageSquare size={20} style={{ color: currentTheme.primary }} />
                </div>
                <p className="text-sm opacity-70 mb-4" style={{ color: currentTheme.text }}>
                  No chat sessions yet.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    handleCreateNewSession();
                    setSidebarOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg font-medium text-white transition-all duration-300"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  Start Your First Chat
                </motion.button>
              </motion.div>
            </div>
          ) : (
            <div className="p-3 lg:p-4 space-y-2">
              {sessionList
                .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
                .map((session, index) => (
                <motion.button
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCurrentSession(session.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full p-3 lg:p-4 rounded-xl text-left transition-all duration-300 border ${
                    currentSessionId === session.id
                      ? 'glass border-white/30 shadow-lg'
                      : 'hover:glass border-transparent hover:border-white/20'
                  }`}
                  style={{
                    backgroundColor: currentSessionId === session.id ? currentTheme.primary + '10' : undefined,
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm line-clamp-1 pr-2" style={{ color: currentTheme.text }}>
                      {session.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs opacity-60 flex-shrink-0" style={{ color: currentTheme.text }}>
                      <Clock size={10} />
                      <span className="hidden sm:inline">{new Date(session.lastActivity).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-xs opacity-70 line-clamp-2 mb-2" style={{ color: currentTheme.text }}>
                    {session.lastMessage}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs opacity-60" style={{ color: currentTheme.text }}>
                      <MessageSquare size={10} />
                      <span>{session.messageCount} messages</span>
                    </div>
                    {currentSessionId === session.id && (
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: currentTheme.primary }}
                      />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 lg:p-6 border-t border-white/10">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="text-base lg:text-lg"
              >
                🎬
              </motion.div>
              <span className="text-xs font-medium" style={{ color: currentTheme.text }}>
                CinePal AI Assistant
              </span>
            </div>
            <p className="text-xs opacity-50" style={{ color: currentTheme.text }}>
              Powered by advanced AI
            </p>
          </div>
        </div>
      </>
    );
  }

  function WelcomeScreen() {
    return (
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          {/* Animated Movie Icon */}
          <motion.div 
            className="relative mb-6 lg:mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div 
              className="w-16 h-16 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl"
              style={{ backgroundColor: currentTheme.primary }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="text-2xl lg:text-4xl"
              >
                🎬
              </motion.div>
            </div>
            
            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full opacity-30"
                style={{ 
                  backgroundColor: currentTheme.secondary,
                  top: `${20 + i * 10}%`,
                  left: `${20 + i * 15}%`,
                }}
                animate={{
                  y: [-10, 10, -10],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 2 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl lg:text-4xl font-bold mb-4 lg:mb-6 bg-gradient-to-r from-current to-opacity-70 bg-clip-text" 
            style={{ color: currentTheme.text }}
          >
            Welcome to CinePal Chat
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base lg:text-lg opacity-70 mb-6 lg:mb-8 leading-relaxed px-4" 
            style={{ color: currentTheme.text }}
          >
            Start a conversation to get personalized movie and TV show recommendations 
            powered by advanced AI. Ask about genres, moods, actors, or anything movie-related!
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateNewSession}
            className="px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden"
            style={{ backgroundColor: currentTheme.primary }}
          >
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
            <span className="relative z-10 flex items-center gap-2">
              <MessageSquare size={18} />
              Start New Chat
            </span>
          </motion.button>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 lg:mt-12 space-y-4"
          >
            <p className="text-sm font-medium" style={{ color: currentTheme.text }}>
              Try asking:
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 px-4">
              {[
                "Recommend me a funny movie for tonight",
                "I want something like Inception",
                "Show me the best horror films from 2023",
                "What's a good romantic comedy?"
              ].map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 rounded-lg glass border border-white/20 text-sm cursor-pointer hover:shadow-lg transition-all duration-300"
                  style={{ color: currentTheme.text }}
                  onClick={() => {
                    const sessionId = createNewSession();
                    setCurrentSession(sessionId);
                    // Here you would also send the suggestion as the first message
                  }}
                >
                  "{suggestion}"
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }
};