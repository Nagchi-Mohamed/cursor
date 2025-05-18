import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import AppBar from '../AppBar';

// Mock the useAuth hook
let mockUseAuthImpl;
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuthImpl()
}));

// Mock the useLanguage hook
let mockUseLanguageImpl;
jest.mock('../../../contexts/LanguageContext', () => ({
  useLanguage: () => mockUseLanguageImpl()
}));

// Removed mock for '../../contexts/ThemeContext' as it does not exist
// Instead, rely on ThemeProvider from test-utils.jsx

// Mock translations
const translations = {
  'app.title': 'MathSphere',
  'auth.login': 'Login',
  'auth.signup': 'Sign Up',
  'auth.logout': 'Logout',
  'theme.dark': 'Switch to Dark Theme',
  'theme.light': 'Switch to Light Theme',
  'language.title': 'Change Language',
  'user.menu': 'User Menu',
  'notifications.title': 'Notifications',
  'nav.dashboard': 'Dashboard',
  'profile.title': 'Profile',
  'admin.panel': 'Admin Panel',
  'menu.label': 'Menu' // For mobile drawer toggle
};

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('AppBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockUseAuthImpl = jest.fn().mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
      error: null,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      setError: jest.fn()
    });

    mockUseLanguageImpl = jest.fn().mockReturnValue({
      language: 'en',
      setLanguage: jest.fn(),
      t: (key) => translations[key] || key
    });

    // No mock for useTheme, rely on ThemeProvider

    // Reset window size for mobile drawer tests
    window.innerWidth = 1024; // Default to desktop
    window.dispatchEvent(new Event('resize'));
  });

  test('renders app bar with title', () => {
    render(<AppBar />);
    expect(screen.getByText(translations['app.title'])).toBeInTheDocument();
  });

  test('navigates to login page when login button is clicked', async () => {
    render(<AppBar />);
    const loginButton = screen.getByTestId('login-button'); 
    fireEvent.click(loginButton);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('navigates to signup page when signup button is clicked', async () => {
    render(<AppBar />);
    const signupButton = screen.getByTestId('signup-button');
    fireEvent.click(signupButton);
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });

  test('shows user menu when authenticated and displays initials', async () => {
    const mockUser = { 
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com'
    };
    
    mockUseAuthImpl.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      token: 'mock-token',
      error: null,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      setError: jest.fn()
    });

    render(<AppBar />);
    
    const userMenuButton = screen.getByTestId('user-menu'); 
    expect(userMenuButton).toBeInTheDocument();
    
    fireEvent.click(userMenuButton);
    
    await waitFor(() => {
      expect(screen.getByText('TU')).toBeInTheDocument();
    });
  });

  test('handles theme toggle', async () => {
    render(<AppBar />);
    const themeButton = screen.getByTestId('theme-toggle');
    fireEvent.click(themeButton);
    expect(themeButton).toBeInTheDocument();
  });

  test('handles language change', async () => {
    const mockSetLanguage = jest.fn();
    mockUseLanguageImpl.mockReturnValue({
      language: 'en',
      setLanguage: mockSetLanguage,
      t: (key) => translations[key] || key
    });

    render(<AppBar />);
    const languageButton = screen.getByTestId('language-selector');
    fireEvent.click(languageButton);
    
    const englishOption = await screen.findByRole('menuitem', { name: 'English' });
    fireEvent.click(englishOption);
    
    expect(mockSetLanguage).toHaveBeenCalledWith('en');
  });

  test('shows notifications button when authenticated', async () => {
    const mockUser = { 
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com'
    };
    
    mockUseAuthImpl.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      token: 'mock-token',
      error: null,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      setError: jest.fn()
    });

    render(<AppBar />);
    
    const notificationsButton = screen.getByTestId('notifications-button');
    expect(notificationsButton).toBeInTheDocument();
  });

  test('handles user menu actions and shows admin panel for admin role', async () => {
    const mockUser = { 
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'admin' // User has admin role
    };
    
    const mockLogout = jest.fn();
    mockUseAuthImpl.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      token: 'mock-token',
      error: null,
      login: jest.fn(),
      signup: jest.fn(),
      logout: mockLogout,
      setError: jest.fn()
    });

    render(<AppBar />);
    
    const userMenuButton = screen.getByTestId('user-menu');
    fireEvent.click(userMenuButton);
    
    expect(await screen.findByRole('menuitem', { name: translations['nav.dashboard'] })).toBeInTheDocument();
    expect(await screen.findByRole('menuitem', { name: translations['profile.title'] })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: translations['auth.logout'] })).toBeInTheDocument();
    expect(await screen.findByRole('menuitem', { name: translations['admin.panel'] })).toBeInTheDocument();
    
    const logoutButton = await screen.findByRole('button', { name: translations['auth.logout'] });
    fireEvent.click(logoutButton);
    expect(mockLogout).toHaveBeenCalled();
  });

  test('handles mobile drawer toggle', async () => {
    const mockOnDrawerToggle = jest.fn();
    render(<AppBar onDrawerToggle={mockOnDrawerToggle} />);
    
    window.innerWidth = 599;
    window.dispatchEvent(new Event('resize'));
    
    let menuButton;
    await waitFor(() => {
      menuButton = screen.getByRole('button', { name: 'open drawer' });
      expect(menuButton).toBeInTheDocument();
    });
    
    fireEvent.click(menuButton);
    expect(mockOnDrawerToggle).toHaveBeenCalled();
  });
});
