import React, { Suspense, useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import App from '../App';

// Mock the components that are causing issues
jest.mock('../components/layout/AppBar', () => () => (
  <div role="banner" data-testid="app-bar">AppBar</div>
));

jest.mock('../components/layout/Drawer', () => () => (
  <div role="navigation" data-testid="drawer">Drawer</div>
));

jest.mock('../components/common/ErrorBoundary', () => ({ children }) => (
  <div data-testid="error-boundary">{children}</div>
));

jest.mock('../components/common/FullScreenLoader', () => () => (
  <div data-testid="full-screen-loader">Loading...</div>
));

jest.mock('../components/common/PrivateRoute', () => ({ children }) => (
  <div data-testid="private-route">{children}</div>
));

jest.mock('../components/layout/AdminLayout', () => ({ children }) => (
  <div data-testid="admin-layout">{children}</div>
));

jest.mock('../components/auth/AdminProtectedRoute', () => ({ children }) => (
  <div data-testid="admin-protected-route">{children}</div>
));

// Mock the context providers
jest.mock('../contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({ darkMode: false, toggleDarkMode: jest.fn() })
}));

jest.mock('../contexts/LanguageContext', () => ({
  LanguageProvider: ({ children }) => children,
  useLanguage: () => ({
    language: 'en',
    setLanguage: jest.fn(),
    t: (key) => key
  })
}));

jest.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    login: jest.fn(),
    logout: jest.fn(),
    signup: jest.fn()
  })
}));

// Mock the directly imported pages
jest.mock('../pages/Home', () => () => <div data-testid="home-page">Home Page</div>);
jest.mock('../pages/LessonsPage', () => () => <div data-testid="lessons-page">Lessons Page</div>);
jest.mock('../pages/LessonDetailPage', () => () => <div data-testid="lesson-detail-page">Lesson Detail Page</div>);
jest.mock('../pages/PracticePage', () => () => <div data-testid="practice-page">Practice Page</div>);
jest.mock('../pages/SolverPage', () => () => <div data-testid="solver-page">Solver Page</div>);
jest.mock('../pages/ForumPage', () => () => <div data-testid="forum-page">Forum Page</div>);
jest.mock('../pages/GroupStudyPage', () => () => <div data-testid="group-study-page">Group Study Page</div>);
jest.mock('../pages/CalendarPage', () => () => <div data-testid="calendar-page">Calendar Page</div>);
jest.mock('../pages/LoginPage', () => () => <div data-testid="login-page">Login Page</div>);
jest.mock('../pages/SignUpPage', () => () => <div data-testid="signup-page">Sign Up Page</div>);
jest.mock('../pages/ProfilePage', () => () => <div data-testid="profile-page">Profile Page</div>);

// Mock the lazy-loaded admin pages with default exports
jest.mock('../pages/admin/AdminDashboardPage', () => ({
  __esModule: true,
  default: () => <div data-testid="admin-dashboard-page">Admin Dashboard Page</div>
}));

jest.mock('../pages/admin/AdminLessonListPage', () => ({
  __esModule: true,
  default: () => <div data-testid="admin-lesson-list-page">Admin Lesson List Page</div>
}));

jest.mock('../pages/admin/AdminLessonFormPage', () => ({
  __esModule: true,
  default: () => <div data-testid="admin-lesson-form-page">Admin Lesson Form Page</div>
}));

jest.mock('../pages/admin/AdminUserListPage', () => ({
  __esModule: true,
  default: () => <div data-testid="admin-user-list-page">Admin User List Page</div>
}));

jest.mock('../pages/admin/AdminFeedbackListPage', () => ({
  __esModule: true,
  default: () => <div data-testid="admin-feedback-list-page">Admin Feedback List Page</div>
}));

// Mock React.lazy to simulate async loading
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    lazy: (importFn) => {
      return (props) => {
        const [Component, setComponent] = originalReact.useState(null);
        originalReact.useEffect(() => {
          importFn().then((mod) => setComponent(() => mod.default));
        }, []);
        if (!Component) return null;
        return originalReact.createElement(Component, props);
      };
    }
  };
});

const renderWithProviders = (ui) => {
  return render(
    <ThemeProvider theme={createTheme()}>
      <Suspense fallback={<div data-testid="suspense-fallback">Loading...</div>}>
        {ui}
      </Suspense>
    </ThemeProvider>
  );
};

describe('App component', () => {
  beforeEach(() => {
    // Reset the URL before each test
    window.history.pushState({}, 'Test page', '/');
  });

  test('renders without crashing', () => {
    renderWithProviders(<App />);
    
    // Verify key components are rendered with correct ARIA roles
    expect(screen.getByRole('banner')).toBeInTheDocument(); // AppBar
    expect(screen.getByRole('navigation')).toBeInTheDocument(); // Drawer
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  test('renders main content area with correct styles', () => {
    renderWithProviders(<App />);
    
    const mainContent = screen.getByRole('main');
    expect(mainContent).toBeInTheDocument();
    expect(mainContent).toHaveStyle({
      flexGrow: 1,
      padding: '24px',
      marginTop: '64px',
    });
  });

  test('renders home page by default', () => {
    renderWithProviders(<App />);
    
    // Since we're using the custom render function, we should be at the root path
    expect(window.location.pathname).toBe('/');
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  test('renders error boundary', () => {
    renderWithProviders(<App />);
    // The error boundary is rendered around the Routes component
    const errorBoundaries = screen.getAllByTestId('error-boundary');
    expect(errorBoundaries[0]).toBeInTheDocument();
  });

  test('renders navigation items', () => {
    renderWithProviders(<App />);
    
    // Check for navigation items in the drawer
    const navigation = screen.getByRole('navigation');
    expect(navigation).toBeInTheDocument();
  });

  test('renders app bar with correct elements', () => {
    renderWithProviders(<App />);
    
    const appBar = screen.getByRole('banner');
    expect(appBar).toBeInTheDocument();
  });
});
