import '@testing-library/jest-dom';
import { mockUseAuth, mockUseLanguage, mockUseTheme } from './__mocks__/contexts';

// Mock local storage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock axios
jest.mock('axios', () => ({
  defaults: {
    headers: {
      common: {}
    }
  },
  get: jest.fn().mockResolvedValue({ data: {} }),
  post: jest.fn().mockResolvedValue({ data: {} }),
  put: jest.fn().mockResolvedValue({ data: {} }),
  delete: jest.fn().mockResolvedValue({ data: {} })
}));

// Silence React Router warnings
jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {
    ...actual,
    UNSAFE_logV6DeprecationWarnings: jest.fn()
  };
});

// Mock AuthContext
const mockAuthHook = jest.fn().mockReturnValue({
  user: null,
  isAuthenticated: false,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  signup: jest.fn(),
  error: null
});

// Export mock functions for use in tests
export { mockAuthHook };

jest.mock('./contexts/LanguageContext', () => {
  const React = require('react');
  const translations = {
    'lessons.difficulty': 'Difficulty',
    'lessons.searchPlaceholder': 'Search lessons...',
    'errors.loadLessonsFailed': 'Failed to load lessons.',
    'actions.provideFeedback': 'Provide Feedback'
  };
  return {
    useLanguage: jest.fn().mockReturnValue({
      language: 'en',
      setLanguage: jest.fn(),
      t: (key) => translations[key] || key
    }),
    LanguageProvider: ({ children }) => React.createElement('div', { 'data-testid': 'language-provider' }, children)
  };
});

jest.mock('./contexts/ThemeContext', () => {
  const React = require('react');
  return {
    useTheme: jest.fn().mockReturnValue({
      palette: {
        mode: 'light',
        primary: {
          main: '#1976d2',
          light: '#42a5f5',
          dark: '#1565c0',
        },
        secondary: {
          main: '#9c27b0',
          light: '#ba68c8',
          dark: '#7b1fa2',
        },
        background: {
          default: '#f5f5f5',
          paper: '#ffffff',
        },
        text: {
          primary: '#000000',
        },
      },
      breakpoints: {
        down: (key) => `@media (max-width:${key === 'sm' ? '600px' : '960px'})`,
        up: (key) => `@media (min-width:${key === 'sm' ? '600px' : '960px'})`,
        values: {
          xs: 0,
          sm: 600,
          md: 960,
          lg: 1280,
          xl: 1920
        }
      },
      spacing: (factor) => `${8 * factor}px`,
      transitions: {
        create: () => 'none',
        duration: {
          shortest: 150,
          shorter: 200,
          short: 250,
          standard: 300,
          complex: 375,
          enteringScreen: 225,
          leavingScreen: 195
        }
      },
      darkMode: false,
      toggleDarkMode: jest.fn()
    }),
    ThemeProvider: ({ children }) => React.createElement('div', { 'data-testid': 'theme-provider' }, children)
  };
});

// Explicitly mock services
jest.mock('./services/AuthService');
jest.mock('./services/LessonService');

// Mock window.matchMedia for Material-UI
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock MUI components causing issues in tests
jest.mock('@mui/material', () => {
  const original = jest.requireActual('@mui/material');
  return {
    ...original,
    useMediaQuery: jest.fn().mockImplementation((query) => {
      // Handle string queries
      if (typeof query === 'string') {
        return false;
      }
      // Handle theme breakpoint queries
      if (query && typeof query === 'function') {
        const theme = {
          breakpoints: {
            values: {
              xs: 0,
              sm: 600,
              md: 960,
              lg: 1280,
              xl: 1920
            }
          }
        };
        return query(theme);
      }
      return true;
    }),
    useTheme: () => ({
      palette: {
        mode: 'light',
        primary: { main: '#1976d2' },
        text: { primary: '#000000' },
        background: { paper: '#ffffff', default: '#f5f5f5' }
      },
      breakpoints: {
        down: (key) => `@media (max-width:${key === 'sm' ? '600px' : '960px'})`,
        up: (key) => `@media (min-width:${key === 'sm' ? '600px' : '960px'})`,
        values: {
          xs: 0,
          sm: 600,
          md: 960,
          lg: 1280,
          xl: 1920
        }
      },
      spacing: (factor) => `${8 * factor}px`,
      transitions: {
        create: () => 'none',
        duration: {
          shortest: 150,
          shorter: 200,
          short: 250,
          standard: 300,
          complex: 375,
          enteringScreen: 225,
          leavingScreen: 195
        }
      }
    })
  };
});

// Mock the fetch API
global.fetch = jest.fn();

// Mock sessionStorage
const sessionStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    getAll: () => store
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock react-router-dom hooks and components
const mockNavigate = jest.fn();
const mockLocation = { pathname: '/', search: '', hash: '', state: null };

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    Navigate: function MockNavigate({ to, state, replace }) {
      return (
        <div data-testid="navigate" data-to={to} data-state={JSON.stringify(state)} data-replace={replace?.toString()}>
          Redirecting to {to}
        </div>
      );
    },
    Link: ({ to, children, ...props }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
    BrowserRouter: ({ children }) => <div>{children}</div>,
    Routes: ({ children }) => <div>{children}</div>,
    Route: ({ element }) => <div>{element}</div>
  };
});

// Export mock functions for use in tests
export { mockNavigate, mockLocation };

// Mock common UI components
jest.mock('./components/layout/AppBar', () => {
  const React = require('react');
  return () => React.createElement(
    'header',
    { 'data-testid': 'app-bar', role: 'banner' },
    React.createElement('h1', {}, 'App Title'),
    React.createElement('button', { 'aria-label': 'menu' }, 'Menu'),
    React.createElement('button', { 'aria-label': 'theme' }, 'Theme'),
    React.createElement('button', { 'aria-label': 'language' }, 'Language'),
    React.createElement('button', { 'data-testid': 'login-button' }, 'Login'),
    React.createElement('button', { 'data-testid': 'signup-button' }, 'Signup'),
    React.createElement('div', { 'data-testid': 'user-menu' }, 'User Menu')
  );
});

jest.mock('./components/layout/Drawer', () => {
  const React = require('react');
  const navigate = require('react-router-dom').useNavigate();
  
  return () => React.createElement(
    'nav',
    { 'data-testid': 'drawer', role: 'navigation' },
    React.createElement(
      'ul',
      { role: 'list' },
      ...Array.from({ length: 8 }).map((_, i) =>
        React.createElement('li', { 
          role: 'listitem', 
          key: i,
          onClick: () => navigate(`/route-${i}`)
        }, `Item ${i + 1}`)
      ),
      React.createElement('hr', { role: 'separator', key: 'sep1' }),
      React.createElement('hr', { role: 'separator', key: 'sep2' })
    )
  );
});

jest.mock('./components/layout/AdminLayout', () => {
  const React = require('react');
  return ({ children }) => React.createElement('div', { 'data-testid': 'admin-layout' }, children);
});

jest.mock('./components/auth/AdminProtectedRoute', () => {
  const React = require('react');
  const { useAuth } = require('./contexts/AuthContext');
  
  return ({ children }) => {
    const auth = useAuth();
    if (auth.isLoading) {
      return React.createElement('div', null, 
        React.createElement('div', { 'data-testid': 'circular-progress' })
      );
    }
    
    if (!auth.isAuthenticated || !auth.user || auth.user.role !== 'admin') {
      return React.createElement('div', { 'data-testid': 'navigate', 'data-to': '/login' });
    }
    
    return React.createElement('div', { 'data-testid': 'admin-protected-route' }, children);
  };
});

jest.mock('./components/common/ErrorBoundary', () => {
  const React = require('react');
  return ({ children }) => React.createElement('div', { 'data-testid': 'error-boundary' }, children);
});

jest.mock('./components/common/FullScreenLoader', () => {
  const React = require('react');
  return () => React.createElement('div', { 'data-testid': 'full-screen-loader' }, 'Loading...');
});

jest.mock('./components/Footer', () => {
  const React = require('react');
  return () => React.createElement('div', { 'data-testid': 'footer' }, 'Footer');
});

// Suppress React 18 console warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/Warning.*not wrapped in act/.test(args[0]) || 
        /Warning.*is deprecated in favor of/.test(args[0])) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock the lazy-loaded admin pages with default exports
jest.mock('./pages/admin/AdminDashboardPage', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: function AdminDashboardPage() {
      return React.createElement('div', { 'data-testid': 'admin-dashboard-page' }, 'Admin Dashboard Page');
    }
  };
});

jest.mock('./pages/admin/AdminLessonListPage', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: function AdminLessonListPage() {
      return React.createElement('div', { 'data-testid': 'admin-lesson-list-page' }, 'Admin Lesson List Page');
    }
  };
});

jest.mock('./pages/admin/AdminLessonFormPage', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: function AdminLessonFormPage() {
      return React.createElement('div', { 'data-testid': 'admin-lesson-form-page' }, 'Admin Lesson Form Page');
    }
  };
});

jest.mock('./pages/admin/AdminUserListPage', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: function AdminUserListPage() {
      return React.createElement('div', { 'data-testid': 'admin-user-list-page' }, 'Admin User List Page');
    }
  };
});

jest.mock('./pages/admin/AdminFeedbackListPage', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: function AdminFeedbackListPage() {
      return React.createElement('div', { 'data-testid': 'admin-feedback-list-page' }, 'Admin Feedback List Page');
    }
  };
});
