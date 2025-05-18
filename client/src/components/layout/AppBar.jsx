import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  FormControl,
  Select,
  Avatar,
  Button,
  Badge,
  Container,
  Divider,
  ListItemIcon,
  ListItemText,
  alpha,
  ButtonGroup
} from '@mui/material';
import {
  School as SchoolIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Language as LanguageIcon,
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  ExpandMore as ExpandMoreIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Main application bar component with theme toggle, language selector, and settings menu
 * @returns {JSX.Element} The AppBar component
 */
const AppBar = ({ drawerWidth, onDrawerToggle }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useLanguage();
  const { darkMode, toggleDarkMode } = useAppTheme();
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = React.useState(null);
  const [languageMenuAnchorEl, setLanguageMenuAnchorEl] = React.useState(null);

  // Add debugging logs
  console.log(`[AppBar COMPONENT] Auth:`, { user, logout });
  console.log(`[AppBar COMPONENT] Theme:`, { darkMode, toggleDarkMode });
  console.log(`[AppBar COMPONENT] Language:`, { language, setLanguage });
  console.log(`[AppBar COMPONENT] t('app.title') result:`, t('app.title'));

  const handleSettingsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClick = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleLanguageMenuClick = (event) => {
    setLanguageMenuAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchorEl(null);
    setLanguageMenuAnchorEl(null);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    handleClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const handleDashboard = () => {
    navigate('/dashboard');
    handleClose();
  };

  const getLanguageLabel = (code) => {
    switch (code) {
      case 'en': return 'English';
      case 'fr': return 'Français';
      case 'es': return 'Español';
      default: return 'English';
    }
  };

  const getLanguageFlagEmoji = (code) => {
    switch (code) {
      case 'en': return '🇺🇸';
      case 'fr': return '🇫🇷';
      case 'es': return '🇪🇸';
      default: return '🇺🇸';
    }
  };

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMenuAnchorEl}
      open={Boolean(mobileMenuAnchorEl)}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        elevation: 3,
        sx: {
          minWidth: 200,
          borderRadius: 2,
          mt: 1
        }
      }}
    >
      <MenuItem onClick={handleDashboard} sx={{ py: 1.5 }}>
        <ListItemIcon>
          <DashboardIcon color="primary" />
        </ListItemIcon>
        <ListItemText primary={t('nav.dashboard')} />
      </MenuItem>
      
      <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
        <ListItemIcon>
          <AccountIcon color="primary" />
        </ListItemIcon>
        <ListItemText primary={t('profile.title')} />
      </MenuItem>
      
      <Divider />
      
      <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
        <ListItemIcon>
          <LogoutIcon color="error" />
        </ListItemIcon>
        <ListItemText primary={t('auth.logout')} sx={{ color: theme.palette.error.main }} />
      </MenuItem>
    </Menu>
  );

  const languageMenu = (
    <Menu
      anchorEl={languageMenuAnchorEl}
      open={Boolean(languageMenuAnchorEl)}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        elevation: 3,
        sx: {
          minWidth: 180,
          borderRadius: 2,
          mt: 1
        }
      }}
    >
      <MenuItem onClick={() => handleLanguageChange('en')} selected={language === 'en'} sx={{ py: 1.5 }}>
        <Box component="span" sx={{ mr: 1, fontSize: '1.2rem', display: 'inline-block', width: 24 }}>🇺🇸</Box> English
      </MenuItem>
      <MenuItem onClick={() => handleLanguageChange('fr')} selected={language === 'fr'} sx={{ py: 1.5 }}>
        <Box component="span" sx={{ mr: 1, fontSize: '1.2rem', display: 'inline-block', width: 24 }}>🇫🇷</Box> Français
      </MenuItem>
      <MenuItem onClick={() => handleLanguageChange('es')} selected={language === 'es'} sx={{ py: 1.5 }}>
        <Box component="span" sx={{ mr: 1, fontSize: '1.2rem', display: 'inline-block', width: 24 }}>🇪🇸</Box> Español
      </MenuItem>
    </Menu>
  );

  const settingsMenu = (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        elevation: 3,
        sx: {
          minWidth: 200,
          borderRadius: 2,
          mt: 1
        }
      }}
    >
      {user && (
        <>
          <Box sx={{ px: 2, py: 1.5, textAlign: 'center' }}>
            <Avatar 
              sx={{ 
                width: 56, 
                height: 56, 
                mx: 'auto', 
                mb: 1,
                bgcolor: theme.palette.primary.main,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            >
              {user.firstName?.[0]}{user.lastName?.[0]}
            </Avatar>
            <Typography variant="subtitle1" fontWeight="bold">
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user.email}
            </Typography>
          </Box>
          
          <Divider />
          
          <MenuItem onClick={handleDashboard} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <DashboardIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary={t('nav.dashboard')} />
          </MenuItem>
          
          <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <AccountIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary={t('profile.title')} />
          </MenuItem>
          
          <Divider />
          
          <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <LogoutIcon color="error" />
            </ListItemIcon>
            <ListItemText primary={t('auth.logout')} sx={{ color: theme.palette.error.main }} />
          </MenuItem>
        </>
      )}
      {!user && (
        <>
          <MenuItem onClick={() => navigate('/login')} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <AccountIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary={t('auth.login')} />
          </MenuItem>
          <MenuItem onClick={() => navigate('/signup')} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <AccountIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary={t('auth.signup')} />
          </MenuItem>
        </>
      )}
    </Menu>
  );

  return (
    <MuiAppBar 
      position="fixed" 
      role="banner"
      data-testid="app-bar"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        ...(drawerWidth && {
          width: `calc(100% - ${drawerWidth}px)`,
          marginLeft: `${drawerWidth}px`,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }),
        boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(90deg, rgba(25, 33, 52, 0.95) 0%, rgba(18, 26, 45, 0.95) 100%)'
          : 'linear-gradient(90deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}
        >
          <SchoolIcon sx={{ mr: 1 }} />
          {t('app.title')}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme Toggle */}
          <Tooltip title={darkMode ? t('theme.light') : t('theme.dark')}>
            <IconButton
              color="inherit"
              onClick={toggleDarkMode}
              aria-label={darkMode ? t('theme.light') : t('theme.dark')}
              data-testid="theme-toggle"
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {/* Language Selector */}
          <Tooltip title={t('language.title')}>
            <IconButton
              color="inherit"
              onClick={handleLanguageMenuClick}
              aria-label={t('language.title')}
              aria-haspopup="true"
              aria-controls="language-menu"
              data-testid="language-selector"
            >
              <LanguageIcon />
            </IconButton>
          </Tooltip>

          {user ? (
            <>
              {/* Notifications */}
              <Tooltip title={t('notifications.title')}>
                <IconButton
                  color="inherit"
                  aria-label={t('notifications.title')}
                  data-testid="notifications-button"
                >
                  <Badge badgeContent={4} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* User Menu */}
              <Tooltip title={t('user.menu')}>
                <IconButton
                  color="inherit"
                  onClick={handleSettingsClick}
                  aria-label={t('user.menu')}
                  aria-haspopup="true"
                  aria-controls="user-menu"
                  data-testid="user-menu"
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: theme.palette.primary.main,
                    }}
                  >
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              {/* Login Button */}
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                aria-label={t('auth.login')}
                data-testid="login-button"
              >
                {t('auth.login')}
              </Button>

              {/* Sign Up Button */}
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate('/signup')}
                aria-label={t('auth.signup')}
                data-testid="signup-button"
              >
                {t('auth.signup')}
              </Button>
            </>
          )}
        </Box>

        {/* Menus */}
        {renderMobileMenu}
        {languageMenu}
        {settingsMenu}
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar; 