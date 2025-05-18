import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  CircularProgress,
  Grid,
  useTheme,
  InputAdornment,
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  School,
  Psychology
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const theme = useTheme();
  console.log('LoginPage.jsx: theme object from useTheme():', JSON.stringify(theme, null, 2)); // DEBUG LINE
  console.log('LoginPage.jsx: theme.palette:', theme ? JSON.stringify(theme.palette, null, 2) : 'theme is undefined'); // DEBUG LINE
  console.log('LoginPage.jsx: theme.palette.secondary:', theme && theme.palette ? JSON.stringify(theme.palette.secondary, null, 2) : 'theme or theme.palette is undefined'); // DEBUG LINE
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || t('errors.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(26, 32, 39, 0.95)'
          : 'rgba(245, 247, 250, 0.95)',
        pt: 8,
        pb: 8,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: theme.palette.primary.main,
          opacity: 0.07,
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: theme.palette.secondary?.main || '#9c27b0',
          opacity: 0.08,
          zIndex: 0
        }}
      />
      
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Welcome Back
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            Log in to continue your mathematical journey
          </Typography>
        </Box>
        
        <Paper 
          elevation={6} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(45, 55, 72, 0.9) 0%, rgba(30, 40, 55, 0.9) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(249, 250, 251, 0.9) 100%)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 70,
                height: 70,
                borderRadius: '50%',
                backgroundColor: theme.palette.primary.main,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <School sx={{ fontSize: 32, color: '#fff' }} />
            </Box>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} role="form">
            <TextField
              fullWidth
              label={t('auth.email')}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                },
              }}
            />
            
            <TextField
              fullWidth
              label={t('auth.password')}
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={toggleShowPassword}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                },
              }}
            />
            
            <Box sx={{ textAlign: 'right', mt: 1, mb: 3 }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2" underline="hover">
                {t('auth.forgotPassword')}
              </Link>
            </Box>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ 
                mt: 1,
                py: 1.5,
                borderRadius: 1.5,
                fontWeight: 600,
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} /> : t('auth.login')}
            </Button>
          </form>
          
          <Divider sx={{ my: 4 }}>
            <Chip label="OR" size="small" />
          </Divider>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                size="large"
                onClick={() => navigate('/signup')}
                sx={{ 
                  py: 1.5,
                  borderRadius: 1.5,
                  fontWeight: 600,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                {t('auth.createAccount')}
              </Button>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              By logging in, you agree to our{' '}
              <Link component={RouterLink} to="/terms" underline="hover">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link component={RouterLink} to="/privacy" underline="hover">
                Privacy Policy
              </Link>
            </Typography>
          </Box>
        </Paper>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Need help? <Link component={RouterLink} to="/contact" underline="hover">Contact Support</Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
