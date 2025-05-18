import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    // You can also log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            {this.props.t ? this.props.t('errors.somethingWentWrong') : 'Something went wrong'}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
          >
            {this.props.t ? this.props.t('actions.refresh') : 'Refresh Page'}
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Wrap the ErrorBoundary with the language context
const ErrorBoundaryWithLanguage = (props) => {
  const { t } = useLanguage();
  return <ErrorBoundary {...props} t={t} />;
};

export default ErrorBoundaryWithLanguage; 