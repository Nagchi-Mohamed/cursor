import React from 'react';
import { Box, Typography, Button } from '@mui/material';

/**
 * @module components/ErrorBoundary
 * @description A reusable error boundary component that catches JavaScript errors in its child component tree.
 * Displays a fallback UI when an error occurs and logs error information in development mode.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log error to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement error reporting service integration
      console.error('Production error:', error, errorInfo);
    } else {
      console.error('Development error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          textAlign="center" 
          p={3}
          sx={{
            minHeight: '50vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Oops! Something went wrong.
          </Typography>
          <Typography variant="body1" gutterBottom>
            We're sorry for the inconvenience. Please try refreshing the page, or contact support if the problem persists.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Refresh Page
          </Button>
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <Box 
              mt={4} 
              textAlign="left" 
              component="pre" 
              sx={{ 
                whiteSpace: 'pre-wrap', 
                wordBreak: 'break-all', 
                maxHeight: '200px', 
                overflowY: 'auto', 
                border: '1px solid #ccc', 
                p: 2, 
                background: '#f5f5f5',
                width: '100%',
                maxWidth: '800px',
              }}
            >
              <Typography variant="subtitle2" color="error" gutterBottom>
                Error Details (Development Only):
              </Typography>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo.componentStack}
            </Box>
          )}
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 