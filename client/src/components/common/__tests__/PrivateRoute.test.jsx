import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';
import { useAuth } from '../../../contexts/AuthContext';

// Mock the useAuth hook
let mockUseAuthImpl;
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => {
    const result = mockUseAuthImpl();
    return result;
  }
}));

// Mock the Navigate component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to }) => {
    return <div data-testid="navigate" data-to={to}>Redirect to {to}</div>;
  }
}));

// Mock the FullScreenLoader component
jest.mock('../../../components/common/FullScreenLoader', () => {
  return () => <div data-testid="full-screen-loader">Loading...</div>;
});

// Test components
const ProtectedContent = () => <div>Protected Content</div>;
const MockLoginPage = () => <div>Login Page</div>;

// Custom render function with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('PrivateRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthImpl = jest.fn().mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      setError: jest.fn()
    });
  });

  test('shows loading state when isLoading is true', () => {
    mockUseAuthImpl.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      setError: jest.fn()
    });

    renderWithRouter(
      <Routes>
        <Route path="/" element={
          <PrivateRoute>
            <ProtectedContent />
          </PrivateRoute>
        } />
      </Routes>
    );

    expect(screen.getByTestId('full-screen-loader')).toBeInTheDocument();
  });

  test('redirects to login when not authenticated', async () => {
    mockUseAuthImpl.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      setError: jest.fn()
    });

    renderWithRouter(
      <Routes>
        <Route path="/" element={
          <PrivateRoute>
            <ProtectedContent />
          </PrivateRoute>
        } />
      </Routes>
    );

    await waitFor(() => {
      const navigate = screen.getByTestId('navigate');
      expect(navigate).toBeInTheDocument();
      expect(navigate).toHaveAttribute('data-to', '/login');
    });
  });

  test('renders children when authenticated', async () => {
    mockUseAuthImpl.mockReturnValue({
      user: { id: '1', name: 'Test User' },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      setError: jest.fn()
    });

    renderWithRouter(
      <Routes>
        <Route path="/" element={
          <PrivateRoute>
            <ProtectedContent />
          </PrivateRoute>
        } />
      </Routes>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
});
