import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer as MuiDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  useTheme,
  useMediaQuery,
  Tooltip,
  Typography,
  alpha,
  Paper
} from '@mui/material';
import {
  Home as HomeIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Calculate as CalculateIcon,
  Forum as ForumIcon,
  Group as GroupIcon,
  CalendarMonth as CalendarIcon,
  Dashboard as DashboardIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;
const collapsedWidth = 72;

const menuItems = [
  { path: '/', icon: HomeIcon, key: 'home' },
  { path: '/dashboard', icon: DashboardIcon, key: 'dashboard', protected: true },
  { path: '/lessons', icon: SchoolIcon, key: 'lessons' },
  { path: '/practice', icon: AssignmentIcon, key: 'practice' },
  { path: '/solver', icon: CalculateIcon, key: 'solver' },
  { path: '/solver/history', icon: HistoryIcon, key: 'history', protected: true },
  { path: '/forum', icon: ForumIcon, key: 'forum' },
  { path: '/group-study', icon: GroupIcon, key: 'groupStudy' },
  { path: '/calendar', icon: CalendarIcon, key: 'calendar' },
];

/**
 * Main navigation drawer component with expandable/collapsible functionality
 * @param {Object} props Component props
 * @param {boolean} props.open Whether the drawer is open (for mobile)
 * @param {Function} props.onClose Function to call when drawer should close (for mobile)
 * @param {number} props.drawerWidth Width of the drawer when expanded
 * @returns {JSX.Element} The Drawer component
 */
const Drawer = ({ open, onClose, drawerWidth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const drawerRef = useRef(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  // Handle focus management
  useEffect(() => {
    const handleFocus = (event) => {
      if (drawerRef.current && drawerRef.current.contains(event.target)) {
        setIsExpanded(true);
      }
    };

    const handleBlur = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    const drawer = drawerRef.current;
    if (drawer) {
      drawer.addEventListener('focusin', handleFocus);
      drawer.addEventListener('focusout', handleBlur);
    }

    return () => {
      if (drawer) {
        drawer.removeEventListener('focusin', handleFocus);
        drawer.removeEventListener('focusout', handleBlur);
      }
    };
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  // Group menu items by category
  const mainMenuItems = menuItems.filter(item => 
    ['home', 'dashboard', 'lessons', 'practice', 'solver'].includes(item.key)
  );
  
  const secondaryMenuItems = menuItems.filter(item => 
    ['history', 'forum', 'groupStudy', 'calendar'].includes(item.key)
  );

  const renderMenuItem = (item) => {
    // Skip protected items if user is not authenticated
    if (item.protected && !user) return null;

    const Icon = item.icon;
    const isSelected = location.pathname === item.path;
    
    const listItem = (
      <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
        <ListItemButton
          selected={isSelected}
          onClick={() => handleNavigation(item.path)}
          sx={{
            minHeight: 48,
            justifyContent: isExpanded ? 'initial' : 'center',
            px: 2.5,
            mx: isExpanded ? 1 : 0.75,
            borderRadius: 2,
            bgcolor: isSelected 
              ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1)
              : 'transparent',
            color: isSelected ? theme.palette.primary.main : 'text.primary',
            '&:hover': {
              bgcolor: isSelected
                ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.15)
                : alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.1 : 0.05),
            }
          }}
          aria-label={t(`nav.${item.key}`)}
          aria-current={isSelected ? 'page' : undefined}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: isExpanded ? 2.5 : 'auto',
              justifyContent: 'center',
              color: isSelected ? 'primary.main' : 'inherit',
              fontSize: 24,
            }}
          >
            <Icon fontSize="inherit" />
          </ListItemIcon>
          {isExpanded && (
            <ListItemText
              primary={t(`nav.${item.key}`)}
              primaryTypographyProps={{
                color: isSelected ? 'primary.main' : 'inherit',
                fontWeight: isSelected ? 600 : 500,
                fontSize: '0.95rem',
              }}
            />
          )}
        </ListItemButton>
      </ListItem>
    );

    return isExpanded ? (
      listItem
    ) : (
      <Tooltip
        key={item.path}
        title={t(`nav.${item.key}`)}
        placement="right"
        arrow
        enterDelay={300}
      >
        {listItem}
      </Tooltip>
    );
  };

  return (
    <MuiDrawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? open : true}
      onClose={onClose}
      ref={drawerRef}
      PaperProps={{
        elevation: isMobile ? 4 : 1,
        sx: {
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(180deg, rgba(22, 28, 36, 0.95) 0%, rgba(17, 23, 31, 0.95) 100%)'
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
          backdropFilter: 'blur(6px)',
        }
      }}
      sx={{
        width: isExpanded ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.standard,
        }),
        '& .MuiDrawer-paper': {
          width: isExpanded ? drawerWidth : collapsedWidth,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
          overflowX: 'hidden',
          borderRight: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        },
      }}
      onMouseEnter={() => !isMobile && setIsExpanded(true)}
      onMouseLeave={() => !isMobile && setIsExpanded(false)}
    >
      <Box sx={{ 
        overflow: 'auto', 
        mt: 8,
        px: isExpanded ? 1 : 0,
        py: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Main menu section */}
        <Box sx={{ mb: 1, mt: 1, px: isExpanded ? 2 : 0 }}>
          {isExpanded && (
            <Typography 
              variant="overline" 
              color="text.secondary" 
              sx={{ 
                fontWeight: 600, 
                fontSize: '0.7rem', 
                letterSpacing: '0.1em',
                display: 'block',
                ml: 2,
                mb: 1
              }}
            >
              {t('nav.mainMenu')}
            </Typography>
          )}
          <List 
            role="navigation" 
            aria-label={t('nav.mainMenu')}
            dense
            disablePadding
          >
            {mainMenuItems.map(renderMenuItem)}
          </List>
        </Box>
        
        <Divider sx={{ 
          my: 2, 
          mx: isExpanded ? 2 : 1, 
          opacity: 0.6 
        }} />
        
        {/* Secondary menu section */}
        <Box sx={{ px: isExpanded ? 2 : 0 }}>
          {isExpanded && (
            <Typography 
              variant="overline" 
              color="text.secondary" 
              sx={{ 
                fontWeight: 600, 
                fontSize: '0.7rem', 
                letterSpacing: '0.1em',
                display: 'block',
                ml: 2,
                mb: 1
              }}
            >
              {t('nav.utilities')}
            </Typography>
          )}
          <List 
            role="navigation" 
            aria-label={t('nav.utilities')}
            dense
            disablePadding
          >
            {secondaryMenuItems.map(renderMenuItem)}
          </List>
        </Box>
        
        {/* Spacer to push admin section to bottom if needed */}
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Admin section if user is admin */}
        {user?.role === 'admin' && (
          <Box sx={{ mt: 2, px: isExpanded ? 2 : 0 }}>
            <Divider sx={{ 
              mb: 2, 
              mx: isExpanded ? 2 : 1, 
              opacity: 0.6 
            }} />
            
            {isExpanded && (
              <Typography 
                variant="overline" 
                color="text.secondary" 
                sx={{ 
                  fontWeight: 600, 
                  fontSize: '0.7rem', 
                  letterSpacing: '0.1em',
                  display: 'block',
                  ml: 2,
                  mb: 1
                }}
              >
                {t('nav.adminSection')}
              </Typography>
            )}
            
            <List 
              role="navigation" 
              aria-label={t('nav.adminSection')}
              dense
              disablePadding
            >
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation('/admin')}
                  selected={location.pathname.startsWith('/admin')}
                  sx={{
                    minHeight: 48,
                    justifyContent: isExpanded ? 'initial' : 'center',
                    px: 2.5,
                    mx: isExpanded ? 1 : 0.75,
                    borderRadius: 2,
                    bgcolor: location.pathname.startsWith('/admin')
                      ? alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.2 : 0.1)
                      : 'transparent',
                    color: location.pathname.startsWith('/admin') ? theme.palette.error.main : 'text.primary',
                    '&:hover': {
                      bgcolor: location.pathname.startsWith('/admin')
                        ? alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.3 : 0.15)
                        : alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.1 : 0.05),
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: isExpanded ? 2.5 : 'auto',
                      justifyContent: 'center',
                      color: location.pathname.startsWith('/admin') ? 'error.main' : 'inherit',
                      fontSize: 24,
                    }}
                  >
                    <DashboardIcon fontSize="inherit" />
                  </ListItemIcon>
                  {isExpanded && (
                    <ListItemText
                      primary={t('admin.panel')}
                      primaryTypographyProps={{
                        color: location.pathname.startsWith('/admin') ? 'error.main' : 'inherit',
                        fontWeight: location.pathname.startsWith('/admin') ? 600 : 500,
                        fontSize: '0.95rem',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        )}
      </Box>
    </MuiDrawer>
  );
};

export default Drawer; 