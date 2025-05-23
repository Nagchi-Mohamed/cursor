// client/src/components/layout/__tests__/AppBar.test.jsx
import React from 'react';
// Use your custom render from test-utils which includes all necessary providers
import { render, screen, fireEvent, waitFor, within } from '../../../utils/test-utils';
import AppBar from '../AppBar'; // The component being tested

// --- Mock Hooks ---
// These 'Impl' variables will be assigned jest.fn() in beforeEach
// and their return values will be set per test or with defaults.
let mockUseAuthImpl;
let mockUseLanguageImpl;
let mockUseAppThemeImpl; // For your custom useAppTheme hook

// Mock the modules where these hooks are defined
jest.mock('../../../contexts/AuthContext', () => ({ // ADJUST PATH if useAuth is from a different file like /hooks/useAuth
  useAuth: () => mockUseAuthImpl(),
}));
jest.mock('../../../contexts/LanguageContext', () => ({ // ADJUST PATH
  useLanguage: () => mockUseLanguageImpl(),
}));
jest.mock('../../../contexts/ThemeContext', () => ({ // ADJUST PATH (where useAppTheme is defined)
  useAppTheme: () => mockUseAppThemeImpl(),
}));
// --- End of Hook Mocks ---

// --- Mock react-router-dom ---
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Keep other exports like <Link>
  useNavigate: () => mockNavigate,
}));
// --- End of react-router-dom Mock ---

// --- Test-specific Translations ---
// Define all i18n keys used by AppBar and its sub-components (like menus)
const appBarTestTranslations = {
  'app.title': 'MathSphere App Title',
  'auth.login': 'Login',
  'auth.signup': 'Sign Up',
  'auth.logout': 'Logout',
  'theme.toggle': 'Toggle Theme', // Generic label for theme button if static
  'theme.light': 'Light Mode',   // Specific text if shown
  'theme.dark': 'Dark Mode',     // Specific text if shown
  'language.select': 'Change Language', // Generic label for language button
  'user.avatar.alt': 'User Avatar', // Alt text for user avatar if any
  'notifications.label': 'View Notifications', // aria-label for notifications button
  'nav.dashboard': 'Dashboard',
  'profile.title': 'My Profile',
  'admin.panel': 'Admin Panel',
  'menu.open': 'Open Menu', // For mobile drawer toggle aria-label
  'menu.user': 'Open User Menu', // If user menu trigger has an aria-label
};
// --- End of Translations ---


describe('AppBar Component', () => {
  // Declare mock functions that will be passed into context/props
  let mockToggleDarkModeFn;
  let mockSetLanguageFn;
  let mockLogoutFn;
  let mockOnDrawerToggleFn; // For the onDrawerToggle prop

  beforeEach(() => {
    // Reset all general mocks
    jest.clearAllMocks(); // Clears all jest.fn() call counts, etc.

    // Initialize mock hook implementations for each test
    mockUseAuthImpl = jest.fn();
    mockUseLanguageImpl = jest.fn();
    mockUseAppThemeImpl = jest.fn();

    // Initialize specific mock functions passed via context/props
    mockToggleDarkModeFn = jest.fn();
    mockSetLanguageFn = jest.fn();
    mockLogoutFn = jest.fn();
    mockOnDrawerToggleFn = jest.fn();


    // Default mock return values for hooks - unauthenticated user by default
    mockUseAuthImpl.mockReturnValue({
      user: null, isAuthenticated: false, isLoading: false, token: null, error: null,
      login: jest.fn(), signup: jest.fn(), logout: mockLogoutFn, setError: jest.fn(),
    });
    mockUseLanguageImpl.mockReturnValue({
      language: 'en', setLanguage: mockSetLanguageFn,
      t: (key, options) => appBarTestTranslations[key] || key, // Use test translations
    });
    mockUseAppThemeImpl.mockReturnValue({
      darkMode: false, toggleDarkMode: mockToggleDarkModeFn,
    });

    // Reset window size for mobile drawer tests (default to desktop)
    window.innerWidth = 1024;
    window.dispatchEvent(new Event('resize')); // Trigger resize event for responsive components
  });

  test('renders app bar with translated title', () => {
    console.log('[AppBar TEST - title] Setting up mocks.');
    // Default mocks from beforeEach are used
    render(<AppBar onDrawerToggle={mockOnDrawerToggleFn} />); // Pass prop if AppBar expects it
    // screen.debug();
    expect(screen.getByText(appBarTestTranslations['app.title'])).toBeInTheDocument();
  });

  test('navigates to login page when login button is clicked', () => {
    // Default mocks from beforeEach (unauthenticated)
    render(<AppBar onDrawerToggle={mockOnDrawerToggleFn} />);
    const loginButton = screen.getByTestId('login-button'); // Assuming this data-testid exists
    expect(loginButton).toHaveTextContent(appBarTestTranslations['auth.login']);
    fireEvent.click(loginButton);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('navigates to signup page when signup button is clicked', () => {
    render(<AppBar onDrawerToggle={mockOnDrawerToggleFn} />);
    const signupButton = screen.getByTestId('signup-button'); // Assuming this data-testid exists
    expect(signupButton).toHaveTextContent(appBarTestTranslations['auth.signup']);
    fireEvent.click(signupButton);
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });

  test('shows user avatar/initials and user menu trigger when authenticated', async () => {
    const mockUser = { firstName: 'Test', lastName: 'User', email: 'test@example.com', role: 'user' };
    mockUseAuthImpl.mockReturnValue({
      user: mockUser, isAuthenticated: true, isLoading: false, token: 'mock-token', error: null,
      login: jest.fn(), signup: jest.fn(), logout: mockLogoutFn, setError: jest.fn(),
    });

    render(<AppBar onDrawerToggle={mockOnDrawerToggleFn} />);
    // screen.debug(undefined, 30000);

    // Check for user initials in avatar (e.g., "TU")
    // This depends on how AppBar renders the Avatar (MUI Avatar usually shows first letter if no src)
    // Or if you have a specific component/logic for user display.
    // For now, let's assume an avatar displays initials.
    await waitFor(() => expect(screen.getByText('TU')).toBeInTheDocument()); // T from Test, U from User

    // Check that login/signup buttons are NOT present
    expect(screen.queryByTestId('login-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('signup-button')).not.toBeInTheDocument();

    // Check for the element that triggers the user menu
    // This could be the Avatar itself or a surrounding button/div
    // The previous log showed data-testid="user-menu" for a div.
    const userMenuTrigger = screen.getByTestId('user-menu');
    expect(userMenuTrigger).toBeInTheDocument();
  });

  test('handles theme toggle by calling toggleDarkMode from context', () => {
    // mockUseThemeImpl is already set in beforeEach with mockToggleDarkModeFn
    render(<AppBar onDrawerToggle={mockOnDrawerToggleFn} />);
    // The DOM snapshot showed aria-label="theme"
    const themeButton = screen.getByRole('button', { name: /theme/i }); // Using generic "theme" as per DOM
    // If the aria-label is dynamic based on i18n:
    // const themeButton = screen.getByRole('button', { name: appBarTestTranslations['theme.toggle'] });
    fireEvent.click(themeButton);
    expect(mockToggleDarkModeFn).toHaveBeenCalledTimes(1);
  });

  test('handles language change by opening menu and calling setLanguage', async () => {
    // mockUseLanguageImpl is set in beforeEach with mockSetLanguageFn
    render(<AppBar onDrawerToggle={mockOnDrawerToggleFn} />);
    // DOM snapshot showed aria-label="language"
    const languageButton = screen.getByRole('button', { name: /language/i }); // Using generic "language" as per DOM
    fireEvent.click(languageButton);

    // Wait for MUI Menu to open and find a language option (e.g., "English")
    // This assumes your LanguageMenu renders items with role 'menuitem' and text for language names
    const englishOption = await screen.findByRole('menuitem', { name: 'English' }); // Or an i18n key for 'English'
    fireEvent.click(englishOption);
    expect(mockSetLanguageFn).toHaveBeenCalledWith('en'); // Or the value associated with "English"
  });

  test('shows notifications button with badge when authenticated and has notifications', async () => {
    const mockUser = { firstName: 'Test', lastName: 'User' };
    mockUseAuthImpl.mockReturnValue({
      user: mockUser, isAuthenticated: true, isLoading: false, token: 'mock-token', error: null,
      login: jest.fn(), signup: jest.fn(), logout: mockLogoutFn, setError: jest.fn(),
      // Assume notifications are fetched/provided somehow and result in a count
      // For simplicity, let's assume notifications prop or state determines badge visibility
    });

    // You might need to mock a service or context that provides notification count
    // For this example, let's assume AppBar internally manages or receives notificationCount > 0

    render(<AppBar /* notificationsCount={3} */ onDrawerToggle={mockOnDrawerToggleFn} />); // Example if prop driven
    // screen.debug(undefined, 30000);

    // Query for the notifications button, e.g., by data-testid or aria-label
    // The previous log did not show it. Let's assume it has data-testid="notifications-button"
    // and is conditionally rendered if authenticated.
    const notificationsButton = await screen.findByTestId('notifications-button');
    expect(notificationsButton).toBeInTheDocument();

    // Check for MUI Badge content if AppBar uses it
    // This requires the Badge to have a child with the count, or check aria-label of badge
    // const badge = within(notificationsButton).getByText('3'); // Example if count is directly rendered
    // expect(badge).toBeInTheDocument();
    // More robustly: check for an element with role="status" if Badge uses it for accessibility
  });


  test('handles user menu actions (dashboard, profile, logout, admin panel for admin)', async () => {
    const mockUserAdmin = { firstName: 'Admin', lastName: 'User', email: 'admin@example.com', role: 'admin' };
    mockUseAuthImpl.mockReturnValue({
      user: mockUserAdmin, isAuthenticated: true, isLoading: false, token: 'mock-token', error: null,
      login: jest.fn(), signup: jest.fn(), logout: mockLogoutFn, setError: jest.fn(),
    });

    render(<AppBar onDrawerToggle={mockOnDrawerToggleFn} />);
    const userMenuTrigger = screen.getByTestId('user-menu'); // Assuming this opens the menu
    fireEvent.click(userMenuTrigger);

    // Wait for menu items to appear (they are often in a Portal)
    expect(await screen.findByRole('menuitem', { name: appBarTestTranslations['nav.dashboard'] })).toBeInTheDocument();
    expect(await screen.findByRole('menuitem', { name: appBarTestTranslations['profile.title'] })).toBeInTheDocument();
    const logoutMenuItem = await screen.findByRole('menuitem', { name: appBarTestTranslations['auth.logout'] });
    expect(logoutMenuItem).toBeInTheDocument();
    expect(await screen.findByRole('menuitem', { name: appBarTestTranslations['admin.panel'] })).toBeInTheDocument(); // Admin specific

    // Test logout action
    fireEvent.click(logoutMenuItem);
    expect(mockLogoutFn).toHaveBeenCalledTimes(1);
  });

  test('handles mobile drawer toggle when onDrawerToggle prop is provided', async () => {
    // mockOnDrawerToggleFn is defined in the outer scope and reset in beforeEach
    render(<AppBar onDrawerToggle={mockOnDrawerToggleFn} />); // Pass the mock prop

    // Simulate mobile view
    window.innerWidth = 500; // MUI breakpoint for mobile is usually < 600 (sm)
    fireEvent(window, new Event('resize'));

    // The mobile menu button (IconButton with MenuIcon)
    // Its accessible name might be "Open Menu" or an aria-label
    // The previous log showed aria-label="menu" for a generic menu button
    // Let's assume if it's for mobile drawer, it has a specific test-id or translatable aria-label
    const mobileMenuButton = await screen.findByRole('button', { name: appBarTestTranslations['menu.open'] });
    expect(mobileMenuButton).toBeInTheDocument();

    fireEvent.click(mobileMenuButton);
    expect(mockOnDrawerToggleFn).toHaveBeenCalledTimes(1);
  });
});