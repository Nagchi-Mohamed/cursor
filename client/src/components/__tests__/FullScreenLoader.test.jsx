import React from 'react';
import { render, screen } from '../../utils/test-utils';
import FullScreenLoader from '../FullScreenLoader';

describe('FullScreenLoader Component', () => {
  test('renders with default loading message', () => {
    render(<FullScreenLoader />);
    
    // Check if the spinner is present
    const loadingSpinner = screen.getByRole('progressbar');
    expect(loadingSpinner).toBeInTheDocument();
    
    // Check if the default message is present
    const defaultMessage = screen.getByText('Loading...');
    expect(defaultMessage).toBeInTheDocument();
  });

  test('renders with custom loading message', () => {
    const customMessage = 'Please wait while your content loads...';
    render(<FullScreenLoader message={customMessage} />);
    
    // Check if the spinner is present
    const loadingSpinner = screen.getByRole('progressbar');
    expect(loadingSpinner).toBeInTheDocument();
    
    // Check if the custom message is present
    const messageElement = screen.getByText(customMessage);
    expect(messageElement).toBeInTheDocument();
    
    // Ensure the default message is not present
    const defaultMessage = screen.queryByText('Loading...');
    expect(defaultMessage).not.toBeInTheDocument();
  });

  test('has correct styling for full screen display', () => {
    render(<FullScreenLoader />);
    
    // Get the main container and check styling
    const container = screen.getByText('Loading...').parentElement;
    
    // Check for fixed positioning
    expect(container).toHaveStyle({
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999
    });
    
    // Check for centered content
    expect(container).toHaveStyle({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    });
  });
}); 