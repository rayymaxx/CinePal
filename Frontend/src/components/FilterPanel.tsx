import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown } from 'lucide-react';
import { FilterOptions } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

const genres = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
  'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
];

const years = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString());

export const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);
  const { currentTheme } = useTheme();

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      genre: undefined,
      year: undefined,
      rating: undefined,
      type: 'all',
      sortBy: 'popularity',
      sortOrder: 'desc',
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="glass rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ background: currentTheme?.background || '#0f0f23' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Filter size={24} style={{ color: currentTheme.primary }} />
                <h2 className="text-2xl font-bold" style={{ color: currentTheme.text }}>
                  Filter Movies & Shows
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full transition-colors"
                style={{ 
                  background: `${currentTheme.primary}20`,
                  color: currentTheme.primary 
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: currentTheme.text }}>
                  Content Type
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'movie', label: 'Movies' },
                    { value: 'tv', label: 'TV Shows' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilters({ ...filters, type: option.value as any })}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        filters.type === option.value
                          ? 'text-white'
                          : 'glass hover:glass-dark'
                      }`}
                      style={{
                        backgroundColor: filters.type === option.value ? currentTheme.primary : undefined,
                        color: filters.type === option.value ? 'white' : currentTheme.text,
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genre Filter */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: currentTheme.text }}>
                  Genre
                </label>
                <select
                  value={filters.genre || ''}
                  onChange={(e) => setFilters({ ...filters, genre: e.target.value || undefined })}
                  className="w-full p-3 rounded-lg border-0 focus:ring-2 transition-all appearance-none cursor-pointer"
                  style={{ 
                    backgroundColor: `${currentTheme.primary}10`,
                    color: currentTheme.text,
                    borderColor: currentTheme.primary,
                    '--tw-ring-color': currentTheme.primary 
                  } as React.CSSProperties}
                >
                  <option value="">All Genres</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre} style={{ color: '#000', backgroundColor: '#fff' }}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: currentTheme.text }}>
                  Release Year
                </label>
                <select
                  value={filters.year || ''}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value || undefined })}
                  className="w-full p-3 rounded-lg border-0 focus:ring-2 transition-all appearance-none cursor-pointer"
                  style={{ 
                    backgroundColor: `${currentTheme.primary}10`,
                    color: currentTheme.text,
                    borderColor: currentTheme.primary,
                    '--tw-ring-color': currentTheme.primary 
                  } as React.CSSProperties}
                >
                  <option value="">Any Year</option>
                  {years.map((year) => (
                    <option key={year} value={year} style={{ color: '#000', backgroundColor: '#fff' }}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: currentTheme.text }}>
                  Minimum Rating: {filters.rating || 0}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={filters.rating || 0}
                  onChange={(e) => setFilters({ ...filters, rating: parseFloat(e.target.value) })}
                  className="w-full"
                  style={{ accentColor: currentTheme.primary }}
                />
                <div className="flex justify-between text-xs opacity-70 mt-1" style={{ color: currentTheme.text }}>
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>

              {/* Sort Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: currentTheme.text }}>
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy || 'popularity'}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                    className="w-full p-3 rounded-lg border-0 focus:ring-2 transition-all appearance-none cursor-pointer"
                    style={{ 
                      backgroundColor: `${currentTheme.primary}10`,
                      color: currentTheme.text,
                      borderColor: currentTheme.primary,
                      '--tw-ring-color': currentTheme.primary 
                    } as React.CSSProperties}
                  >
                    <option value="popularity" style={{ color: '#000', backgroundColor: '#fff' }}>Popularity</option>
                    <option value="rating" style={{ color: '#000', backgroundColor: '#fff' }}>Rating</option>
                    <option value="year" style={{ color: '#000', backgroundColor: '#fff' }}>Release Year</option>
                    <option value="title" style={{ color: '#000', backgroundColor: '#fff' }}>Title</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: currentTheme.text }}>
                    Order
                  </label>
                  <select
                    value={filters.sortOrder || 'desc'}
                    onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as any })}
                    className="w-full p-3 rounded-lg border-0 focus:ring-2 transition-all appearance-none cursor-pointer"
                    style={{ 
                      backgroundColor: `${currentTheme.primary}10`,
                      color: currentTheme.text,
                      borderColor: currentTheme.primary,
                      '--tw-ring-color': currentTheme.primary 
                    } as React.CSSProperties}
                  >
                    <option value="desc" style={{ color: '#000', backgroundColor: '#fff' }}>Descending</option>
                    <option value="asc" style={{ color: '#000', backgroundColor: '#fff' }}>Ascending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReset}
                className="flex-1 py-3 rounded-lg glass hover:glass-dark transition-all font-medium"
                style={{ color: currentTheme.text }}
              >
                Reset Filters
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApply}
                className="flex-1 py-3 rounded-lg font-medium text-white transition-all"
                style={{ backgroundColor: currentTheme.primary }}
              >
                Apply Filters
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};