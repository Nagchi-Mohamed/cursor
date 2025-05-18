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
  Chip,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Person as PersonIcon,
  Badge as BadgeIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  School,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { t } = useLanguage();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (formData.password !== formData.confirmPassword) {
      setError(t('errors.passwordsDoNotMatch'));
      return;
    }

    setLoading(true);

    try {
      await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || t('errors.signupFailed'));
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Uppercase check
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Lowercase check
    if (/[a-z]/.test(password)) strength += 1;
    
    // Number check
    if (/[0-9]/.test(password)) strength += 1;
    
    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  
  const getStrengthColor = (strength) => {
    if (strength <= 1) return theme.palette.error.main;
    if (strength <= 3) return theme.palette.warning.main;
    return theme.palette.success.main;
  };
  
  const getStrengthLabel = (strength) => {
    if (strength <= 1) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
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
          left: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: theme.palette.secondary.main,
          opacity: 0.07,
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          right: -150,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: theme.palette.primary.main,
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
              backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Join MathSphere
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            Create your account and begin your mathematical journey
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
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('auth.firstName')}
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('auth.lastName')}
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                    },
                  }}
                />
              </Grid>
            </Grid>
            
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
            
            {formData.password && (
              <Box sx={{ mt: 1, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Password Strength:
                  </Typography>
                  <Typography variant="caption" sx={{ color: getStrengthColor(passwordStrength), fontWeight: 600 }}>
                    {getStrengthLabel(passwordStrength)}
                  </Typography>
                </Box>
                <Box sx={{ width: '100%', height: 4, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                  <Box 
                    sx={{ 
                      height: '100%', 
                      width: `${(passwordStrength / 5) * 100}%`, 
                      bgcolor: getStrengthColor(passwordStrength),
                      transition: 'width 0.3s ease'
                    }} 
                  />
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  <Chip 
                    label="8+ characters" 
                    size="small" 
                    color={formData.password.length >= 8 ? 'success' : 'default'}
                    variant={formData.password.length >= 8 ? 'filled' : 'outlined'}
                    sx={{ fontSize: '0.7rem' }}
                  />
                  <Chip 
                    label="Uppercase" 
                    size="small" 
                    color={/[A-Z]/.test(formData.password) ? 'success' : 'default'}
                    variant={/[A-Z]/.test(formData.password) ? 'filled' : 'outlined'}
                    sx={{ fontSize: '0.7rem' }}
                  />
                  <Chip 
                    label="Lowercase" 
                    size="small" 
                    color={/[a-z]/.test(formData.password) ? 'success' : 'default'}
                    variant={/[a-z]/.test(formData.password) ? 'filled' : 'outlined'}
                    sx={{ fontSize: '0.7rem' }}
                  />
                  <Chip 
                    label="Number" 
                    size="small" 
                    color={/[0-9]/.test(formData.password) ? 'success' : 'default'}
                    variant={/[0-9]/.test(formData.password) ? 'filled' : 'outlined'}
                    sx={{ fontSize: '0.7rem' }}
                  />
                  <Chip 
                    label="Special char" 
                    size="small" 
                    color={/[^A-Za-z0-9]/.test(formData.password) ? 'success' : 'default'}
                    variant={/[^A-Za-z0-9]/.test(formData.password) ? 'filled' : 'outlined'}
                    sx={{ fontSize: '0.7rem' }}
                  />
                </Box>
              </Box>
            )}
            
            <TextField
              fullWidth
              label={t('auth.confirmPassword')}
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
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
                      onClick={toggleShowConfirmPassword}
                      edge="end"
                      aria-label="toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ 
                mt: 3,
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
              {loading ? <CircularProgress size={24} /> : t('auth.signup')}
            </Button>
          </form>
          
          <Divider sx={{ my: 4 }}>
            <Chip label="OR" size="small" />
          </Divider>
          
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => navigate('/login')}
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
            {t('auth.haveAccount')}
          </Button>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              By signing up, you agree to our{' '}
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

export default SignUpPage; 