import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Movie, ChatMessage, FilterOptions, User } from '../types';

// Auth Store
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: true,
      setUser: (user) => {
        const isAuth = !!user;
        set({ user, isAuthenticated: isAuth });
      },
      setToken: (token) => {
        set({ token });
      },
      setLoading: (loading) => set({ loading }),
      logout: () => set({ user: null, token: null, isAuthenticated: false, loading: false }),
    }),
    {
      name: 'cinepal-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => {
        return (state, action) => {
          if (state) {
            const hasValidAuth = !!(state.user && state.token);
          }
        };
      },
    }
  )
);

// Chat Store
interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  lastActivity: string;
}

interface ChatStore {
  sessions: Record<string, ChatSession>;
  currentSessionId: string | null;
  loading: boolean;
  addMessage: (sessionId: string, message: ChatMessage) => void;
  setCurrentSession: (sessionId: string) => void;
  createNewSession: () => string;
  updateSessionName: (sessionId: string, name: string) => void;
  loadSessionHistory: (sessionId: string, messages: ChatMessage[]) => void;
  clearSession: (sessionId: string) => void;
  clearAllSessions: () => void;
  setLoading: (loading: boolean) => void;
  exportSession: (sessionId: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: {},
      currentSessionId: null,
      loading: false,
      addMessage: (sessionId, message) =>
        set((state) => {
          const session = state.sessions[sessionId];
          if (session) {
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  messages: [...(session.messages || []), message],
                  lastActivity: new Date().toISOString(),
                },
              },
            };
          }
          return state;
        }),
      setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),
      createNewSession: () => {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: {
              id: sessionId,
              name: 'New Chat',
              messages: [],
              lastActivity: new Date().toISOString(),
            },
          },
          currentSessionId: sessionId,
        }));
        return sessionId;
      },
      updateSessionName: (sessionId, name) =>
        set((state) => {
          const session = state.sessions[sessionId];
          if (session) {
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: { ...session, name },
              },
            };
          }
          return state;
        }),
      loadSessionHistory: (sessionId, messages) =>
        set((state) => {
          const session = state.sessions[sessionId];
          if (session) {
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: { ...session, messages },
              },
            };
          }
          return state;
        }),
      clearSession: (sessionId) =>
        set((state) => {
          const { [sessionId]: removed, ...remainingSessions } = state.sessions;
          return {
            sessions: remainingSessions,
            currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId,
          };
        }),
      clearAllSessions: () => set({ sessions: {}, currentSessionId: null }),
      setLoading: (loading) => set({ loading }),
      exportSession: (sessionId) => {
        const { sessions } = get();
        const session = sessions[sessionId];
        if (session) {
          const dataStr = JSON.stringify({
            sessionId,
            name: session.name,
            messages: session.messages,
            exportedAt: new Date().toISOString(),
          }, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `cinepal-chat-${sessionId}.json`;
          link.click();
          URL.revokeObjectURL(url);
        }
      },
    }),
    {
      name: 'cinepal-chat',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Movies Store
interface MoviesStore {
  movies: Movie[];
  watchlist: Movie[];
  favorites: Movie[];
  filters: FilterOptions;
  loading: boolean;
  searchQuery: string;
  setMovies: (movies: Movie[]) => void;
  addToWatchlist: (movie: Movie) => void;
  removeFromWatchlist: (movieId: string) => void;
  addToFavorites: (movie: Movie) => void;
  removeFromFavorites: (movieId: string) => void;
  setFilters: (filters: FilterOptions) => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  clearWatchlist: () => void;
  clearFavorites: () => void;
  isInWatchlist: (movieId: string) => boolean;
  isInFavorites: (movieId: string) => boolean;
  getFilteredMovies: () => Movie[];
}

export const useMoviesStore = create<MoviesStore>()(
  persist(
    (set, get) => ({
      movies: [],
      watchlist: [],
      favorites: [],
      filters: {
        type: 'all',
        sortBy: 'popularity',
        sortOrder: 'desc',
      },
      loading: false,
      searchQuery: '',
      setMovies: (movies) => set({ movies }),
      addToWatchlist: (movie) =>
        set((state) => ({
          watchlist: state.watchlist.some(m => m.show_id === movie.show_id)
            ? state.watchlist
            : [...state.watchlist, movie],
        })),
      removeFromWatchlist: (movieId) =>
        set((state) => ({
          watchlist: state.watchlist.filter(m => m.show_id !== movieId),
        })),
      addToFavorites: (movie) =>
        set((state) => ({
          favorites: state.favorites.some(m => m.show_id === movie.show_id)
            ? state.favorites
            : [...state.favorites, movie],
        })),
      removeFromFavorites: (movieId) =>
        set((state) => ({
          favorites: state.favorites.filter(m => m.show_id !== movieId),
        })),
      setFilters: (filters) => set({ filters }),
      setLoading: (loading) => set({ loading }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      clearWatchlist: () => set({ watchlist: [] }),
      clearFavorites: () => set({ favorites: [] }),
      isInWatchlist: (movieId) => get().watchlist.some(m => m.show_id === movieId),
      isInFavorites: (movieId) => get().favorites.some(m => m.show_id === movieId),
      getFilteredMovies: () => {
        const { movies, filters, searchQuery } = get();
        let filtered = [...movies];

        if (searchQuery) {
          filtered = filtered.filter(movie =>
            movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            movie.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase())) ||
            movie.cast.some(actor => actor.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }

        if (filters.type && filters.type !== 'all') {
          filtered = filtered.filter(movie => movie.type === filters.type);
        }

        if (filters.genre) {
          filtered = filtered.filter(movie => movie.genres.includes(filters.genre!));
        }

        if (filters.year) {
          filtered = filtered.filter(movie => movie.release_date.includes(filters.year!));
        }

        if (filters.rating) {
          filtered = filtered.filter(movie => movie.tmdb_rating >= filters.rating!);
        }

        if (filters.sortBy) {
          filtered.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (filters.sortBy) {
              case 'rating':
                aValue = a.tmdb_rating;
                bValue = b.tmdb_rating;
                break;
              case 'year':
                aValue = new Date(a.release_date).getFullYear();
                bValue = new Date(b.release_date).getFullYear();
                break;
              case 'title':
                aValue = a.title.toLowerCase();
                bValue = b.title.toLowerCase();
                break;
              default:
                aValue = a.tmdb_rating;
                bValue = b.tmdb_rating;
            }

            if (filters.sortOrder === 'asc') {
              return aValue > bValue ? 1 : -1;
            } else {
              return aValue < bValue ? 1 : -1;
            }
          });
        }

        return filtered;
      },
    }),
    {
      name: 'cinepal-movies',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        watchlist: state.watchlist,
        favorites: state.favorites,
        filters: state.filters,
      }),
    }
  )
);

// UI Store
interface UIStore {
  theme: string;
  sidebarOpen: boolean;
  showFilters: boolean;
  showKeyboardHelp: boolean;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
  }>;
  setTheme: (theme: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setShowFilters: (show: boolean) => void;
  setShowKeyboardHelp: (show: boolean) => void;
  addNotification: (notification: Omit<UIStore['notifications'][0], 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: 'eccentric-blue',
      sidebarOpen: false,
      showFilters: false,
      showKeyboardHelp: false,
      notifications: [],
      setTheme: (theme) => set({ theme }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setShowFilters: (showFilters) => set({ showFilters }),
      setShowKeyboardHelp: (showKeyboardHelp) => set({ showKeyboardHelp }),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            { ...notification, id: Date.now().toString() },
          ],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id),
        })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'cinepal-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
      }),
    }
  )
);