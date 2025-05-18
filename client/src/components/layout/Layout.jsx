import { useState } from 'react';
import { Box } from '@mui/material';
import AppBar from './AppBar';
import Drawer from './Drawer';

const drawerWidth = 240;

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        drawerWidth={drawerWidth} 
        onDrawerToggle={handleDrawerToggle} 
      />
      <Drawer
        drawerWidth={drawerWidth}
        open={mobileOpen}
        onClose={handleDrawerToggle}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px', // Height of AppBar
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default Layout; 