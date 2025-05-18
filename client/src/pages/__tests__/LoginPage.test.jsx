import React from 'react';
import { render as actualRenderFromTestUtils, screen, waitFor, fireEvent } from '../../utils/test-utils';

// Log to see if it's our custom render or RTL's original
console.log('LoginPage.test.jsx: Is actualRenderFromTestUtils the custom render?', actualRenderFromTestUtils.name === 'customRender' || actualRenderFromTestUtils.toString().includes('MuiThemeProvider'));

const render = actualRenderFromTestUtils;
import LoginPage from '../LoginPage';

// Mock the auth service
jest.mock('../../services/authService', () => ({
  login: jest.fn()
}));

// Mock the auth context
const mockUseAuth = jest.fn();
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock the language context
jest.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: jest.fn(),
    t: (key) => key
  })
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('LoginPage Component', () => {
  let authService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = require('../../services/authService');
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null
    });
  });

  test('renders login form', () => {
    render(<LoginPage />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('submits form with valid credentials', async () => {
    const mockUser = { id: 1, name: 'Test User' };
    authService.login.mockResolvedValueOnce(mockUser);
    
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('displays error message on failed login', async () => {
    const errorMessage = 'Invalid credentials';
    authService.login.mockRejectedValueOnce(new Error(errorMessage));
    
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('disables login button during submission', async () => {
    // Make the login promise never resolve
    authService.login.mockImplementation(() => new Promise(() => {}));
    
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    
    // Check for loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('navigates to signup page', () => {
    render(<LoginPage />);
    
    const signupLink = screen.getByRole('link', { name: /signup/i });
    fireEvent.click(signupLink);
    
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });
}); 