import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Film, Heart, User, Search, Filter, Settings, Star, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeSelector } from '../components/ThemeSelector';
import { FilterPanel } from '../components/FilterPanel';
import { MovieCard } from '../components/MovieCard';
import { FilterOptions, Movie } from '../types';
import { useMoviesStore, useUIStore } from '../store';

// Mock data with actual TMDB poster images
const mockMovies: Movie[] = [
  {
    show_id: '603',
    title: 'The Matrix',
    type: 'movie',
    genres: ['Action', 'Sci-Fi'],
    plot: 'A computer programmer discovers reality is a simulation and joins a rebellion against the machines.',
    release_date: '1999-03-31',
    runtime: '136 min',
    cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
    directors: ['The Wachowskis'],
    poster_url: 'https://image.tmdb.org/t/p/original/p96dm7sCMn4VYAStA6siNz30G1r.jpg',
    tmdb_rating: 8.7,
  },
  {
    show_id: '27205',
    title: 'Inception',
    type: 'movie',
    genres: ['Action', 'Thriller', 'Sci-Fi'],
    plot: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
    release_date: '2010-07-16',
    runtime: '148 min',
    cast: ['Leonardo DiCaprio', 'Marion Cotillard', 'Tom Hardy'],
    directors: ['Christopher Nolan'],
    poster_url: 'https://image.tmdb.org/t/p/original/gqgwNjwjSqGkOqkE2rppogenu4v.jpg',
    tmdb_rating: 8.8,
  },
  {
    show_id: '157336',
    title: 'Interstellar',
    type: 'movie',
    genres: ['Drama', 'Sci-Fi'],
    plot: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    release_date: '2014-11-07',
    runtime: '169 min',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    directors: ['Christopher Nolan'],
    poster_url: 'https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    tmdb_rating: 8.6,
  },
  {
    show_id: '155',
    title: 'The Dark Knight',
    type: 'movie',
    genres: ['Action', 'Crime', 'Drama'],
    plot: 'Batman faces the Joker, a criminal mastermind who wants to plunge Gotham City into anarchy.',
    release_date: '2008-07-18',
    runtime: '152 min',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
    directors: ['Christopher Nolan'],
    poster_url: 'https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    tmdb_rating: 9.0,
  },
];

export const Dashboard: React.FC = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const { currentTheme } = useTheme();
  const { 
    watchlist, 
    addToWatchlist, 
    removeFromWatchlist, 
    isInWatchlist,
    filters,
    setFilters 
  } = useMoviesStore();
  const { showFilters, setShowFilters } = useUIStore();


  // 1. If we are still verifying the session, show a loader
  if (authLoading || !currentTheme) {
    console.log('Dashboard - still loading auth or theme');
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Initializing dashboard...</p>
        </div>
      </div>
    );
  }

  // 2. If no user is found after loading, the app should redirect to login
  if (!user) {
    console.log('Dashboard - no user after loading, returning null');
    return null;
  }

  console.log('Dashboard safety check passed');

  // 3. Safe stats calculation with division by zero guard
  const stats = {
    watchlistCount: watchlist.length,
    totalMovies: mockMovies.length,
    avgRating: mockMovies.length > 0 
      ? mockMovies.reduce((acc, movie) => acc + movie.tmdb_rating, 0) / mockMovies.length 
      : 0,
  };

  return (
    <div className="min-h-screen bg-slate-950" style={{ background: currentTheme?.background || '#0f0f23' }}>
      {/* Navigation */}
      <nav className="glass border-b border-white/10 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <motion.div 
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: currentTheme.primary }}
              >
                <Film size={24} color="white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: currentTheme.text }}>
                  CinePal
                </h1>
                <p className="text-xs opacity-60" style={{ color: currentTheme.text }}>
                  AI Movie Companion
                </p>
              </div>
            </motion.div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                style={{ color: currentTheme.text }}
              >
                <Film size={18} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">Discover</span>
              </Link>
              
              <Link
                to="/chat"
                data-tour="chat-button"
                className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                style={{ color: currentTheme.text }}
              >
                <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">Chat</span>
              </Link>

              <button
                onClick={() => setShowFilters(true)}
                data-tour="filters"
                className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                style={{ color: currentTheme.text }}
              >
                <Filter size={18} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">Filters</span>
              </button>

              <Link
                to="/settings"
                className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                style={{ color: currentTheme.text }}
              >
                <Settings size={18} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">Settings</span>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div data-tour="theme-selector">
                <ThemeSelector />
              </div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3 px-4 py-2 rounded-xl glass border border-white/20"
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  {(user?.user_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium" style={{ color: currentTheme.text }}>
                    {user?.user_name}
                  </p>
                  <p className="text-xs opacity-60" style={{ color: currentTheme.text }}>
                    {user?.preferences?.length || 0} preferences
                  </p>
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="px-4 py-2 text-sm rounded-xl hover:bg-red-500/20 transition-all duration-300 text-red-500 font-medium"
              >
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-current via-current to-opacity-70 bg-clip-text" 
              style={{ color: currentTheme?.text || '#ffffff' }}
            >
              Welcome back, {user?.user_name || 'Friend'}! 🎬
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg opacity-70 max-w-2xl mx-auto" 
              style={{ color: currentTheme.text }}
            >
              Discover your next favorite movie or show with AI-powered recommendations tailored just for you.
            </motion.p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300"
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: currentTheme.primary + '20' }}
              >
                <Heart size={24} style={{ color: currentTheme.primary }} />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: currentTheme.text }}>
                {stats.watchlistCount}
              </h3>
              <p className="text-sm opacity-70" style={{ color: currentTheme.text }}>
                Movies in Watchlist
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300"
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: currentTheme.secondary + '20' }}
              >
                <TrendingUp size={24} style={{ color: currentTheme.secondary }} />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: currentTheme.text }}>
                {stats.totalMovies}
              </h3>
              <p className="text-sm opacity-70" style={{ color: currentTheme.text }}>
                Movies Available
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300"
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: currentTheme.accent + '20' }}
              >
                <Star size={24} style={{ color: currentTheme.accent }} />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: currentTheme.text }}>
                {stats.avgRating.toFixed(1)}
              </h3>
              <p className="text-sm opacity-70" style={{ color: currentTheme.text }}>
                Average Rating
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <Link
            to="/chat"
            className="glass rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 group hover:scale-105"
          >
            <div className="flex items-center gap-6">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg"
                style={{ backgroundColor: currentTheme.primary }}
              >
                <MessageCircle size={28} color="white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: currentTheme.text }}>
                  Start Chatting
                </h3>
                <p className="text-sm opacity-70" style={{ color: currentTheme.text }}>
                  Get personalized AI recommendations
                </p>
              </div>
            </div>
          </Link>

          <button
            onClick={() => setShowFilters(true)}
            className="glass rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 group hover:scale-105"
          >
            <div className="flex items-center gap-6">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg"
                style={{ backgroundColor: currentTheme.secondary }}
              >
                <Search size={28} color="white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: currentTheme.text }}>
                  Browse & Filter
                </h3>
                <p className="text-sm opacity-70" style={{ color: currentTheme.text }}>
                  Explore by genre, year, rating
                </p>
              </div>
            </div>
          </button>

          <div className="glass rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 group" data-tour="watchlist">
            <div className="flex items-center gap-6">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg"
                style={{ backgroundColor: currentTheme.accent }}
              >
                <Heart size={28} color="white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: currentTheme.text }}>
                  My Watchlist
                </h3>
                <p className="text-sm opacity-70" style={{ color: currentTheme.text }}>
                  {watchlist.length} movies saved for later
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Featured Movies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold mb-2" style={{ color: currentTheme.text }}>
                Featured Movies
              </h3>
              <p className="opacity-70" style={{ color: currentTheme.text }}>
                Handpicked selections just for you
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl glass hover:shadow-lg transition-all duration-300 border border-white/20"
              style={{ color: currentTheme.primary }}
            >
              <Filter size={18} />
              <span className="font-medium">Filter Movies</span>
            </motion.button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {mockMovies.map((movie, index) => (
              <motion.div
                key={movie.show_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <MovieCard
                  movie={movie}
                  onAddToWatchlist={addToWatchlist}
                  onRemoveFromWatchlist={removeFromWatchlist}
                  isInWatchlist={isInWatchlist(movie.show_id)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Watchlist Section */}
        {watchlist.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mt-16"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold mb-2" style={{ color: currentTheme.text }}>
                  My Watchlist
                </h3>
                <p className="opacity-70" style={{ color: currentTheme.text }}>
                  Movies you've saved to watch later
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
                <Clock size={16} style={{ color: currentTheme.primary }} />
                <span className="text-sm font-medium" style={{ color: currentTheme.text }}>
                  {watchlist.length} movies
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {watchlist.map((movie, index) => (
                <motion.div
                  key={movie.show_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                >
                  <MovieCard
                    movie={movie}
                    onAddToWatchlist={addToWatchlist}
                    onRemoveFromWatchlist={removeFromWatchlist}
                    isInWatchlist={true}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={setFilters}
        currentFilters={filters}
      />
    </div>
  );
};