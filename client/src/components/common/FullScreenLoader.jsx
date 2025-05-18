import React from 'react';
import { Box, CircularProgress } from '@mui/material';

/**
 * A full-screen loading indicator component.
 * Used as a fallback for Suspense when lazy-loading components.
 * @returns {JSX.Element} A centered loading spinner
 */
const FullScreenLoader = () => {
  return (
    <Box
      data-testid="loader"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundColor: (theme) => 
          theme.palette.mode === 'dark' 
            ? 'rgba(0, 0, 0, 0.5)' 
            : 'rgba(255, 255, 255, 0.5)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default FullScreenLoader;
