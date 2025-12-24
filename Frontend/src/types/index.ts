export interface User {
  id: string;
  user_name: string;
  user_email: string;
  preferences: string[];
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginRequest {
  user_name: string;
  password: string;
}

export interface RegisterRequest {
  user_name: string;
  user_email: string;
  password: string;
  password_confirmation: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface ChatMessage {
  id: string;
  message: string;
  response?: string;
  timestamp: Date;
  isUser: boolean;
  reactions?: string[];
  suggested_shows?: string[];
}

export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  suggested_shows: string[];
}

export interface Movie {
  show_id: string;
  title: string;
  type: string;
  genres: string[];
  plot: string;
  release_date: string;
  runtime: string;
  cast: string[];
  directors: string[];
  poster_url: string;
  tmdb_rating: number;
}

export interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  className: string;
}

export interface FilterOptions {
  genre?: string;
  year?: string;
  rating?: number;
  type?: 'movie' | 'tv' | 'all';
  sortBy?: 'rating' | 'year' | 'title' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
}