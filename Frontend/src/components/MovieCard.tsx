import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Play, Calendar, Clock, Users } from 'lucide-react';
import { Movie } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface MovieCardProps {
  movie: Movie;
  onAddToWatchlist?: (movie: Movie) => void;
  onRemoveFromWatchlist?: (movieId: string) => void;
  isInWatchlist?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  isInWatchlist = false,
}) => {
  const [showTrailer, setShowTrailer] = useState(false);
  const { currentTheme } = useTheme();

  const getYouTubeVideoId = (title: string) => {
    // This would normally search YouTube API, but for demo we'll generate a placeholder
    return `${title.replace(/\s+/g, '').toLowerCase()}_trailer`;
  };

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      onRemoveFromWatchlist?.(movie.show_id);
    } else {
      onAddToWatchlist?.(movie);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="glass rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.poster_url || '/api/placeholder/300/450'}
          alt={movie.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://via.placeholder.com/300x450/333/fff?text=${encodeURIComponent(movie.title)}`;
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowTrailer(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium"
              >
                <Play size={16} />
                Trailer
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleWatchlistToggle}
                className={`p-2 rounded-lg backdrop-blur-sm transition-colors ${
                  isInWatchlist 
                    ? 'bg-red-500/80 text-white' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Heart size={16} fill={isInWatchlist ? 'currentColor' : 'none'} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm">
          <Star size={12} fill="currentColor" className="text-yellow-400" />
          {movie.tmdb_rating.toFixed(1)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2" style={{ color: currentTheme.text }}>
          {movie.title}
        </h3>

        {/* Genres */}
        <div className="flex flex-wrap gap-1 mb-3">
          {movie.genres.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="px-2 py-1 text-xs rounded-full"
              style={{ 
                backgroundColor: currentTheme.primary + '20',
                color: currentTheme.primary 
              }}
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Meta Info */}
        <div className="space-y-2 text-sm opacity-70" style={{ color: currentTheme.text }}>
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            {movie.release_date}
          </div>
          
          <div className="flex items-center gap-2">
            <Clock size={14} />
            {movie.runtime}
          </div>

          {movie.cast.length > 0 && (
            <div className="flex items-center gap-2">
              <Users size={14} />
              <span className="line-clamp-1">
                {movie.cast.slice(0, 2).join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Plot */}
        <p className="text-sm mt-3 opacity-80 line-clamp-3" style={{ color: currentTheme.text }}>
          {movie.plot}
        </p>
      </div>

      {/* Trailer Modal */}
      {showTrailer && (
        <TrailerModal
          title={movie.title}
          videoId={getYouTubeVideoId(movie.title)}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </motion.div>
  );
};

interface TrailerModalProps {
  title: string;
  videoId: string;
  onClose: () => void;
}

const TrailerModal: React.FC<TrailerModalProps> = ({ title, videoId, onClose }) => {
  const { currentTheme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="bg-black rounded-xl overflow-hidden max-w-4xl w-full aspect-video"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold">{title} - Trailer</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="aspect-video">
          {/* Placeholder for YouTube embed */}
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <Play size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">Trailer for {title}</p>
              <p className="text-sm opacity-70 mt-2">
                In a real implementation, this would embed a YouTube video
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};