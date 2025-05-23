import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext.jsx';
import { LanguageContext } from '../contexts/LanguageContext.jsx';
import { testingTheme } from '../theme';
import MuiButton from '@mui/material/Button';

// Define default auth context values for testing
const defaultAuthContextValue = {
  user: {
    id: 'test-user-123',
    name: 'Test User',
    email: 'test@example.com'
  },
  isAuthenticated: true,
  isLoading: false,
  token: 'test-token',
  error: null,
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
  setError: jest.fn()
};

// Define minimal default app theme context values for testing
const defaultAppThemeContextValue = {
  darkMode: false,
  toggleDarkMode: jest.fn()
};

// Define minimal default language context values for testing
const defaultLanguageContextValue = {
  language: 'en',
  setLanguage: jest.fn(),
  t: (key) => key // simple translation function returning key
};

const defaultTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

class TestErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log error info here if needed
    // console.error('TestErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="test-error">Test Error Boundary</div>;
    }
    return this.props.children;
  }
}

const AllTheProviders = ({ children, providerProps = {} }) => {
  // Merge defaults with test-specific overrides
  const authValue = { ...defaultAuthContextValue, ...providerProps.authContextValue };
  const appThemeValue = { ...defaultAppThemeContextValue, ...providerProps.appThemeContextValue };
  const languageValue = { ...defaultLanguageContextValue, ...providerProps.languageContextValue };

  // If specific translations are passed for a test, use them
  if (providerProps.languageContextValue && providerProps.languageContextValue.translations) {
    languageValue.t = (key, options) => {
      const translation = providerProps.languageContextValue.translations[key];
      if (translation) {
        if (options && typeof options.count === 'number') {
          // Super simple pluralization for test, adapt if needed
          return typeof translation === 'object' ? (options.count === 1 ? translation.one : translation.other) : translation;
        }
        return translation;
      }
      return key; // Fallback to key if translation not found
    };
  }

  // Determine MUI theme based on appThemeValue.darkMode, with fallback to defaultTheme
  const baseTheme = testingTheme || defaultTheme;
  const muiTestTheme = createTheme({
    ...baseTheme,
    palette: {
      ...baseTheme.palette,
      mode: appThemeValue.darkMode ? 'dark' : 'light',
    },
  });

  return (
    <TestErrorBoundary>
      <BrowserRouter>
        <AuthContext.Provider value={authValue}>
          <ThemeProvider value={appThemeValue}>
            <MuiThemeProvider theme={muiTestTheme}>
              <LanguageContext.Provider value={languageValue}>
                {children}
              </LanguageContext.Provider>
            </MuiThemeProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    </TestErrorBoundary>
  );
};

const customRender = (ui, options = {}) => {
  if (options.route && window.location.pathname !== options.route) {
    window.history.pushState({}, 'Test page: ' + options.route, options.route);
  }

  return rtlRender(ui, {
    wrapper: ({ children }) => <AllTheProviders providerProps={options.providerProps}>{children}</AllTheProviders>,
    ...options,
  });
};

export * from '@testing-library/react';
export { customRender as render };
export { defaultAuthContextValue };
