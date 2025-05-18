import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  FormControl,
  Select,
  Box,
  Typography,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Language as LanguageIcon,
  AdminPanelSettings as AdminPanelIcon,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * Settings menu component that provides access to user settings, authentication,
 * theme toggle, and language selection.
 * @returns {JSX.Element} Settings menu component
 */
const SettingsMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { isAuthenticated, user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  /**
   * Handles the click event on the settings icon.
   * @param {React.MouseEvent<HTMLButtonElement>} event - The click event
   */
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Handles the close event of the settings menu.
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * Handles the logout action.
   * Navigates to home page after successful logout.
   */
  const handleLogout = async () => {
    await logout();
    handleClose();
    navigate('/');
  };

  /**
   * Handles navigation to a specific route.
   * @param {string} path - The route path to navigate to
   */
  const handleNavigation = (path) => {
    navigate(path);
    handleClose();
  };

  /**
   * Handles language change.
   * @param {React.ChangeEvent<{value: unknown}>} event - The change event
   */
  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label={t('settings')}
      >
        <SettingsIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 280, maxWidth: '100%' },
        }}
      >
        {isAuthenticated ? (
          <>
            <MenuItem onClick={() => handleNavigation('/profile')}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t('profile')} />
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t('logout')} />
            </MenuItem>
            {user?.role === 'admin' && (
              <MenuItem
                onClick={() => {
                  handleClose();
                  navigate('/admin/dashboard');
                }}
                component={Link}
                to="/admin/dashboard"
              >
                <ListItemIcon>
                  <AdminPanelIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={t('admin.panel')} />
              </MenuItem>
            )}
          </>
        ) : (
          <>
            <MenuItem onClick={() => handleNavigation('/login')}>
              <ListItemIcon>
                <LoginIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t('login')} />
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/signup')}>
              <ListItemIcon>
                <PersonAddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t('signup')} />
            </MenuItem>
          </>
        )}
        <Divider />
        <MenuItem>
          <ListItemIcon>
            {darkMode ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText primary={t('darkMode')} />
          <Switch
            edge="end"
            checked={darkMode}
            onChange={toggleDarkMode}
          />
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <LanguageIcon fontSize="small" />
          </ListItemIcon>
          <Box sx={{ flexGrow: 1 }}>
            <FormControl fullWidth size="small">
              <Select
                value={language}
                onChange={handleLanguageChange}
                displayEmpty
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="fr">Français</MenuItem>
                <MenuItem value="es">Español</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </MenuItem>
      </Menu>
    </>
  );
};

export default SettingsMenu; 