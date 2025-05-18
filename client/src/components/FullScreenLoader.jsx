import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * @module components/FullScreenLoader
 * @description A full-screen loading component that displays a centered spinner and optional message.
 * Used as a fallback for React.Suspense and other loading states.
 * @param {Object} props - Component props
 * @param {string} [props.message] - Optional loading message to display
 */
const FullScreenLoader = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.paper',
        zIndex: 9999,
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  );
};

export default FullScreenLoader; 