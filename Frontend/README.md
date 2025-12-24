# CinePal Frontend - AI Movie Companion

A modern, responsive React 19 frontend for the CinePal AI movie recommendation system. Built with TypeScript, Tailwind CSS, and Framer Motion, featuring comprehensive authentication, state management, and a beautiful glassmorphic UI.

## 🎯 Overview

CinePal Frontend is a feature-rich web application that provides users with AI-powered movie recommendations, interactive chat sessions, personalized watchlists, and a customizable theme system. The application emphasizes security, performance, and user experience with modern React patterns and best practices.

## ✨ Key Features

### 🔐 Authentication & Authorization
- **Secure JWT Authentication**: Token-based authentication with secure storage
- **Protected Routes**: Role-based access control and route protection
- **Session Management**: 24-hour configurable session duration
- **Automatic Token Refresh**: Seamless token management on activity
- **Logout Protection**: Secure cleanup on logout or session expiry

### 🎨 Theme System
- **8 Curated Themes**:
  - Eccentric Blue (Default)
  - Cinema Classic (Red & Gold)
  - Midnight Purple
  - Netflix Dark
  - Retro Neon (Pink & Cyan)
  - Forest Green
  - Sunset Orange
  - Monochrome Elegance
- **Live Theme Switching**: Instant theme changes without page reload
- **Persistent Theme Selection**: Automatic theme restoration
- **Glassmorphic Design**: Modern glass-effect UI components
- **Smooth Transitions**: Beautiful animations on theme changes

### 💬 AI Chat System
- **Interactive AI Conversations**: Natural language movie discussions
- **Session Management**: Multiple independent chat sessions
- **Persistent Chat History**: Auto-save conversations to localStorage
- **Message Export**: Download chat history as JSON format
- **Real-time Feedback**: Loading states and typing indicators
- **Dynamic Responses**: AI-powered personalized recommendations

### 🎬 Movie Management
- **Rich Movie Cards**: 
  - High-quality poster images
  - IMDb/TMDB ratings display
  - Genre and cast information
  - Release dates and runtime
- **Watchlist Feature**: Save movies for later
- **Advanced Filtering**:
  - Filter by genre, year, rating, type
  - Multiple sorting options (popularity, rating, year, title)
  - Search by title, genre, or cast member
- **Responsive Grid**: Adaptive layout for mobile, tablet, and desktop

### ⌨️ Keyboard Navigation
- **Global Shortcuts**:
  - `Ctrl+/` or `Cmd+/`: Show keyboard help
  - `Escape`: Close modals
  - Custom application shortcuts
- **Accessibility First**: Full keyboard navigation support
- **Screen Reader Support**: Semantic HTML and ARIA labels

### 📱 Mobile Experience
- **Responsive Design**: Mobile-first approach
- **Mobile Sidebar**: Easy navigation on mobile devices
- **Touch Optimized**: Large touch targets for mobile
- **Offline Support**: PWA capabilities with service worker
- **Progressive Enhancement**: Works on all device sizes

### 🔔 Notifications
- **Themed Notifications**: Matches current app theme
- **Multiple Types**: Success, error, warning, info messages
- **Auto-dismiss**: Configurable auto-hide duration
- **Stacking**: Multiple notifications displayed simultaneously
- **User Feedback**: Visual feedback for all actions

### 🚀 Performance Features
- **Lazy Loading**: Code splitting and route-based lazy loading
- **Image Optimization**: Placeholder handling and lazy image loading
- **Memoization**: Optimized component rendering with React.memo
- **Debounced Inputs**: Optimized search and filter handling
- **Efficient State**: Minimal re-renders with proper dependency management

### 🎥 Loading Animations
- **Custom Loaders**:
  - Popcorn animation
  - Film reel spinner
  - Movie ticket animation
  - Clapperboard animation
  - Projector beam effect
- **Smooth Transitions**: Framer Motion-powered animations
- **Visual Feedback**: Loading states for all async operations

## 🏗️ Architecture

### Project Structure

```
frontend/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── ChatInterface.tsx    # Chat interface with message handling
│   │   ├── MovieCard.tsx        # Individual movie card component
│   │   ├── Dashboard.tsx        # Main dashboard page
│   │   ├── FilterPanel.tsx      # Advanced movie filtering
│   │   ├── KeyboardShortcuts.tsx# Keyboard shortcut handler
│   │   ├── LoadingAnimation.tsx # Custom loading spinners
│   │   ├── LoadingPage.tsx      # Full-page loading state
│   │   ├── MobileSidebar.tsx    # Mobile navigation sidebar
│   │   ├── NotificationSystem.tsx# Toast notification system
│   │   ├── ParticleBackground.tsx# Animated background
│   │   ├── ProtectedRoute.tsx   # Auth-protected route wrapper
│   │   ├── SessionExpiryWarning.tsx # Session warning modal
│   │   └── ThemeSelector.tsx    # Theme switching UI
│   │
│   ├── contexts/                # React Context providers
│   │   ├── AuthContext.tsx      # Authentication state & logic
│   │   └── ThemeContext.tsx     # Theme state & utilities
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useOffline.ts        # Offline detection hook
│   │   └── useSessionManager.ts # Session management hook
│   │
│   ├── pages/                   # Page-level components
│   │   ├── LoginPage.tsx        # Login & registration
│   │   ├── Dashboard.tsx        # Home dashboard
│   │   ├── ChatPage.tsx         # AI chat interface
│   │   └── Settings.tsx         # User settings
│   │
│   ├── services/                # API communication
│   │   ├── authService.ts       # Auth API calls
│   │   └── chatService.ts       # Chat API calls
│   │
│   ├── store/                   # Zustand state management
│   │   └── index.ts             # All store definitions
│   │
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts             # Shared types & interfaces
│   │
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   ├── index.css                # Global styles
│   └── App.css                  # App-specific styles
│
├── public/                      # Static assets
│   ├── manifest.json            # PWA manifest
│   └── sw.js                    # Service worker
│
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS config
├── tsconfig.json                # TypeScript config
├── package.json                 # Dependencies
└── README.md                    # This file
```

### State Management (Zustand)

The application uses Zustand for centralized state management with persistence:

#### Auth Store
```typescript
{
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}
```

#### Chat Store
```typescript
{
  sessions: Record<string, ChatMessage[]>;
  currentSessionId: string | null;
  loading: boolean;
  addMessage: (sessionId: string, message: ChatMessage) => void;
  setCurrentSession: (sessionId: string) => void;
  createNewSession: () => string;
  clearSession: (sessionId: string) => void;
  clearAllSessions: () => void;
  exportSession: (sessionId: string) => void;
}
```

#### Movies Store
```typescript
{
  movies: Movie[];
  watchlist: Movie[];
  favorites: Movie[];
  filters: FilterOptions;
  searchQuery: string;
  loading: boolean;
  addToWatchlist: (movie: Movie) => void;
  removeFromWatchlist: (movieId: string) => void;
  isInWatchlist: (movieId: string) => boolean;
  setFilters: (filters: FilterOptions) => void;
  setSearchQuery: (query: string) => void;
}
```

#### UI Store
```typescript
{
  theme: string;
  sidebarOpen: boolean;
  showFilters: boolean;
  showKeyboardHelp: boolean;
  notifications: Notification[];
  setTheme: (theme: string) => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}
```

### Data Flow

```
App.tsx (Root)
  ├── ThemeProvider (Wraps entire app)
  ├── AuthProvider (Manages auth state)
  └── Router
      ├── ProtectedRoute
      │   ├── Dashboard (Movies)
      │   ├── ChatPage (AI Chat)
      │   └── Settings
      └── LoginPage (Public)
```

## 🛠️ Technology Stack

| Technology | Purpose | Version |
|-----------|---------|---------|
| React | UI Framework | 19.2.0 |
| TypeScript | Type Safety | 5.9.3 |
| Vite | Build Tool | 7.2.4 |
| Tailwind CSS | Styling | 4.1.18 |
| Framer Motion | Animations | 12.23.26 |
| Zustand | State Management | 5.0.9 |
| React Router | Navigation | 7.11.0 |
| Axios | HTTP Client | 1.13.2 |
| Lucide React | Icons | 0.562.0 |
| React Hot Toast | Notifications | 2.6.0 |
| React Hotkeys Hook | Keyboard Shortcuts | 5.2.1 |

## 📥 Installation & Setup

### Prerequisites
- Node.js 18.0 or higher
- npm 9.0 or higher
- Backend API running (see Backend README)

### Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd frontend

# 2. Install dependencies
npm install

# 3. Create environment configuration
# No env file needed for development - uses defaults

# 4. Start development server
npm run dev

# 5. Open browser
# Navigate to http://localhost:5173
```

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview

# Preview is available at http://localhost:4173
```

## 🔧 Configuration

### Vite Configuration (`vite.config.ts`)

The development server includes proxy configuration for seamless API integration:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '/api'),
    },
    '/auth': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    }
  }
}
```

### Tailwind Configuration (`tailwind.config.js`)

Customized for CinePal design system with theme variables and color schemes.

### TypeScript Configuration (`tsconfig.json`)

- Strict mode enabled
- ES2020 target
- JSX React Automatic Runtime
- Module resolution: ES modules

## 🚀 Development Workflow

### Available Scripts

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Run ESLint
npm run lint

# Preview production build locally
npm run preview
```

### Development Tips

1. **Hot Module Replacement (HMR)**: Changes are instantly reflected in the browser
2. **Source Maps**: Available for debugging
3. **Component Library**: Reusable components in `src/components`
4. **Custom Hooks**: Reusable logic in `src/hooks`
5. **Type Safety**: Full TypeScript support

## 🔐 Security Considerations

### Authentication Flow

1. User logs in with credentials
2. Backend returns JWT token
3. Token stored in localStorage
4. Token included in all API requests (Authorization header)
5. Token automatically cleared on logout
6. Session expiry managed server-side

### Protected Routes

All routes except `/login` require authentication via `ProtectedRoute` component:

```tsx
<ProtectedRoute requireAuth={true}>
  <Dashboard />
</ProtectedRoute>
```

### CORS & API Security

- Vite proxy handles CORS during development
- Production deployment requires CORS configuration on backend
- Secure token transmission via Authorization headers

## 📱 Mobile & PWA

### Mobile Optimization

- Responsive Tailwind breakpoints
- Touch-optimized components
- Mobile sidebar for navigation
- Viewport meta tags configured

### Progressive Web App

- Service worker for offline support
- App manifest for installation
- Cache strategies for assets
- Offline fallback pages

## 🎨 Theming Guide

### Adding a New Theme

1. Define theme in `contexts/ThemeContext.tsx`:

```typescript
const themes: Theme[] = [
  {
    id: 'my-theme',
    name: 'My Theme',
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    accent: '#FFE66D',
    background: '#1A1A2E',
    text: '#FFFFFF',
    className: 'theme-my-theme',
  },
  // ... other themes
];
```

2. Use theme colors in components:

```tsx
<div style={{ backgroundColor: currentTheme.background, color: currentTheme.text }}>
  Themed content
</div>
```

## 🧪 Testing

Currently, the project supports ESLint for code quality:

```bash
npm run lint
```

Future testing setup:
- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests with Playwright

## 📊 Performance Optimization

### Code Splitting
- Route-based lazy loading with React.lazy
- Dynamic imports for heavy components

### Image Optimization
- Lazy loading with loading="lazy"
- Placeholder images for fallback
- WebP support where available

### State Management
- Zustand for minimal overhead
- Selective subscriptions to store changes
- Middleware for persistence only when needed

### Rendering
- React.memo for pure components
- useCallback for stable function references
- useMemo for expensive computations
- Proper dependency arrays in hooks

## 🐛 Debugging

### Browser DevTools
- React Developer Tools extension
- Redux DevTools (Zustand compatible)
- Network tab for API debugging
- Console for error tracking

### Application Logs
- Auth flow logging
- API request/response logging
- Component render logging (development only)
- Error boundaries for crash prevention

## 📚 API Integration

### Auth Service (`services/authService.ts`)

```typescript
// Login
await authService.login({ user_name, password });

// Register
await authService.register({ user_name, user_email, password, password_confirmation });

// Get Profile
await authService.getProfile();

// Set Auth Token
authService.setAuthToken(token);
```

### Chat Service (`services/chatService.ts`)

```typescript
// Send Message
await chatService.sendMessage(message, sessionId);

// Get Chat History
await chatService.getChatHistory(sessionId);
```

## 🤝 Contributing

### Code Style
- TypeScript strict mode enforced
- ESLint configuration for code quality
- Tailwind CSS for consistent styling
- Prettier for code formatting

### Commit Guidelines
- Clear, descriptive commit messages
- Feature branches for new features
- Pull requests with detailed descriptions

### Component Guidelines
- Functional components with hooks
- TypeScript interfaces for props
- Reusable and composable design
- Proper error handling

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for utility-first styling
- Framer Motion for beautiful animations
- Zustand for elegant state management
- Vite for lightning-fast development

---

**CinePal Frontend** - Your AI-powered movie companion experience! 🎬✨
