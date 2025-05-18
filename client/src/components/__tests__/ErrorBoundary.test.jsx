import React from 'react';
import { render, screen, fireEvent } from '../../utils/test-utils';
import ErrorBoundary from '../ErrorBoundary';

// Mock console.error to prevent test output pollution
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Component that throws an error for testing purposes
const ErrorThrowingComponent = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal component rendering</div>;
};

describe('ErrorBoundary Component', () => {
  test('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child-content">Child content</div>
      </ErrorBoundary>
    );
    
    const childContent = screen.getByTestId('child-content');
    expect(childContent).toBeInTheDocument();
    expect(childContent).toHaveTextContent('Child content');
  });

  test('displays error UI when error is thrown', () => {
    // We need to mock window.location.reload
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: mockReload },
    });

    // Using ErrorBoundary with a component that throws an error
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Verify error message is displayed
    expect(screen.getByText('Oops! Something went wrong.')).toBeInTheDocument();
    expect(screen.getByText(/We're sorry for the inconvenience/)).toBeInTheDocument();
    
    // Verify refresh button is present
    const refreshButton = screen.getByRole('button', { name: /refresh page/i });
    expect(refreshButton).toBeInTheDocument();
    
    // Click the refresh button and verify it calls window.location.reload
    fireEvent.click(refreshButton);
    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  test('shows error details in development environment', () => {
    // Save original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;
    
    // Set to development explicitly for this test
    process.env.NODE_ENV = 'development';
    
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Look for the development-only error details section
    expect(screen.getByText('Error Details (Development Only):')).toBeInTheDocument();
    
    // Expect error message to be displayed
    expect(screen.getByText(/Error: Test error/)).toBeInTheDocument();
    
    // Reset NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  test('does not show error details in production environment', () => {
    // Save original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;
    
    // Set to production explicitly for this test
    process.env.NODE_ENV = 'production';
    
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Error details should not be present in production
    expect(screen.queryByText('Error Details (Development Only):')).not.toBeInTheDocument();
    
    // Reset NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  test('logs error information in development mode', () => {
    // Save original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;
    
    // Set to development explicitly for this test
    process.env.NODE_ENV = 'development';
    
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Verify error was logged to console
    expect(console.error).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      'Development error:',
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
    
    // Reset NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });
}); 