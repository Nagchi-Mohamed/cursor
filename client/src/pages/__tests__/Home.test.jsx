import React from 'react';
import { render, screen, fireEvent } from '../../utils/test-utils';
import Home from '../Home';

// Mock useMediaQuery
jest.mock('@mui/material/useMediaQuery', () => {
  return jest.fn().mockImplementation(() => false);
});

// Mock the Footer component
jest.mock('../../components/Footer', () => () => <footer data-testid="footer-mock">Mock Footer</footer>);

// Mock the useLanguage hook
let mockUseLanguageImpl;
jest.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => mockUseLanguageImpl(),
  LanguageProvider: ({ children }) => children
}));

// Mock the useAuth hook
let mockUseAuthImpl;
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuthImpl(),
  AuthProvider: ({ children }) => children
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockUseAuthImpl = jest.fn().mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn()
    });

    mockUseLanguageImpl = jest.fn().mockReturnValue({
      language: 'en',
      setLanguage: jest.fn(),
      t: (key) => key
    });
  });

  const renderHome = () => {
    return render(<Home />);
  };

  test('renders the hero section with correct heading', () => {
    renderHome();
    expect(screen.getByText('Mastering Mathematics Through Technology')).toBeInTheDocument();
    expect(screen.getByText(/Experience the future of math learning/)).toBeInTheDocument();
  });

  test('renders the feature section with all features', () => {
    renderHome();
    expect(screen.getByText('Comprehensive Learning Platform')).toBeInTheDocument();
    expect(screen.getByText('AI-Powered Problem Solver')).toBeInTheDocument();
    expect(screen.getByText('Interactive Learning Curriculum')).toBeInTheDocument();
    expect(screen.getByText('Adaptive Practice Sets')).toBeInTheDocument();
    expect(screen.getByText('Collaborative Learning Community')).toBeInTheDocument();
  });

  test('renders how it works section with 3 steps', () => {
    renderHome();
    expect(screen.getByText('How MathSphere Works')).toBeInTheDocument();
    expect(screen.getByText('Input Your Problem')).toBeInTheDocument();
    expect(screen.getByText('Receive Comprehensive Solution')).toBeInTheDocument();
    expect(screen.getByText('Deepen Understanding & Progress')).toBeInTheDocument();
  });

  test('renders testimonials section', () => {
    renderHome();
    expect(screen.getByText('Trusted by Educators & Students')).toBeInTheDocument();
    expect(screen.getByText(/Dr. Emily Richardson/)).toBeInTheDocument();
    expect(screen.getByText(/Prof. Alexander Wei/)).toBeInTheDocument();
  });

  test('renders statistics section with correct values', () => {
    renderHome();
    expect(screen.getByText('500,000+')).toBeInTheDocument();
    expect(screen.getByText('12,000+')).toBeInTheDocument();
    expect(screen.getByText('98%')).toBeInTheDocument();
    expect(screen.getByText('150+')).toBeInTheDocument();
  });

  test('renders footer component', () => {
    renderHome();
    expect(screen.getByTestId('footer-mock')).toBeInTheDocument();
  });

  test('CTA buttons navigate to correct routes when not authenticated', () => {
    renderHome();
    
    // Find the "Get Started For Free" button and click it
    const getStartedBtn = screen.getByText('Get Started For Free');
    fireEvent.click(getStartedBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
    
    // Find the "Try Solver Demo" button and click it
    const solverDemoBtn = screen.getByText('Try Solver Demo');
    fireEvent.click(solverDemoBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/solver');
  });
  
  test('CTA button navigates to dashboard when authenticated', () => {
    mockUseAuthImpl.mockReturnValue({
      user: { name: 'Test User' },
      isAuthenticated: true,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn()
    });
    
    renderHome();
    
    // Find the "Go to Dashboard" button and click it
    const dashboardBtn = screen.getByText('Go to Dashboard');
    fireEvent.click(dashboardBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
