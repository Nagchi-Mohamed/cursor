import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminProtectedRoute from '../AdminProtectedRoute';
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
  return () => <div data-testid="circular-progress">Loading...</div>;
});

// Test components
const AdminContent = () => <div>Admin Content</div>;
const MockLoginPage = () => <div>Login Page</div>;

// Custom render function with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AdminProtectedRoute Component', () => {
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
          <AdminProtectedRoute>
            <AdminContent />
          </AdminProtectedRoute>
        } />
      </Routes>
    );

    expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
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
          <AdminProtectedRoute>
            <AdminContent />
          </AdminProtectedRoute>
        } />
      </Routes>
    );

    await waitFor(() => {
      const navigate = screen.getByTestId('navigate');
      expect(navigate).toBeInTheDocument();
      expect(navigate).toHaveAttribute('data-to', '/login');
    });
  });

  test('redirects to login when user is not admin', async () => {
    mockUseAuthImpl.mockReturnValue({
      user: { id: '1', name: 'Test User', role: 'user' },
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
          <AdminProtectedRoute>
            <AdminContent />
          </AdminProtectedRoute>
        } />
      </Routes>
    );

    await waitFor(() => {
      const navigate = screen.getByTestId('navigate');
      expect(navigate).toBeInTheDocument();
      expect(navigate).toHaveAttribute('data-to', '/login');
    });
  });

  test('renders children when user is admin', async () => {
    mockUseAuthImpl.mockReturnValue({
      user: { id: '1', name: 'Test Admin', role: 'admin' },
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
          <AdminProtectedRoute>
            <AdminContent />
          </AdminProtectedRoute>
        } />
      </Routes>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });
});
