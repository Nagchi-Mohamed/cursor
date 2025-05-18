import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import mainTheme from '../theme';

console.log('test-utils.jsx: mainTheme object:', JSON.stringify(mainTheme, null, 2)); // DEBUG LINE

const customRender = (ui, options) => {
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <BrowserRouter>
        <MuiThemeProvider theme={mainTheme}>
          <LanguageProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LanguageProvider>
        </MuiThemeProvider>
      </BrowserRouter>
    ),
    ...options
  });
};

// Mock MUI Button to handle endIcon prop
jest.mock('@mui/material/Button', () => {
  const original = jest.requireActual('@mui/material/Button');
  return {
    ...original,
    __esModule: true,
    default: ({ children, endIcon, ...props }) => (
      <button {...props}>
        {children}
        {endIcon && <span data-testid="end-icon">{endIcon}</span>}
      </button>
    )
  };
});

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
