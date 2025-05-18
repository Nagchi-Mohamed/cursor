import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Snackbar,
  useTheme,
  Chip,
  LinearProgress,
  Tooltip,
  Badge
} from '@mui/material';
import {
  School as SchoolIcon,
  Calculate as CalculateIcon,
  MenuBook as MenuBookIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  EmojiEvents as TrophyIcon,
  Timeline as TimelineIcon,
  Psychology as PsychologyIcon,
  Assignment as AssignmentIcon,
  ArrowForward as ArrowIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import ProgressService from '../services/ProgressService';

const ProfilePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProgressService.getUserProfile();
      setProfile(data);
    } catch (err) {
      setError(t('errors.profileLoadFailed'));
      console.error('Error loading profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityClick = (type, id) => {
    switch (type) {
      case 'lesson':
        navigate(`/lessons/${id}`);
        break;
      case 'practice':
        navigate(`/practice/${id}`);
        break;
      case 'solution':
        navigate(`/solver/history`);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '80vh'
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3, fontWeight: 500 }}>
          Loading your profile...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  // Mock data for achievement badges and stats if needed
  const achievements = [
    { name: 'Problem Solver', icon: <CalculateIcon />, level: 2, description: 'Solved 50+ problems' },
    { name: 'Quick Learner', icon: <SchoolIcon />, level: 3, description: 'Completed 10+ lessons' },
    { name: 'Math Enthusiast', icon: <PsychologyIcon />, level: 1, description: 'Visited the platform for 7 consecutive days' },
  ];

  // Calculate progress percentages
  const calculateProgressPercentage = (completed, total) => {
    return Math.min(Math.round((completed / total) * 100), 100);
  };

  // Mock progress data if needed
  const progressData = {
    algebra: calculateProgressPercentage(profile?.progress?.algebra?.completed || 0, profile?.progress?.algebra?.total || 10),
    calculus: calculateProgressPercentage(profile?.progress?.calculus?.completed || 0, profile?.progress?.calculus?.total || 10),
    geometry: calculateProgressPercentage(profile?.progress?.geometry?.completed || 0, profile?.progress?.geometry?.total || 10),
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(18, 24, 36, 0.95)'
          : 'rgba(246, 249, 252, 0.95)',
        minHeight: '100vh',
        pt: 4,
        pb: 8,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: theme.palette.primary.main,
          opacity: 0.04,
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '5%',
          left: '5%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: theme.palette.secondary.main,
          opacity: 0.05,
          zIndex: 0
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        <Grid container spacing={4}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                borderRadius: 3,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(45, 55, 72, 0.9) 0%, rgba(30, 40, 55, 0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(249, 250, 251, 0.9) 100%)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0.05,
                  background: 'url("/images/math-pattern.svg") no-repeat top right',
                  backgroundSize: '40%',
                  zIndex: 0
                }}
              />
              
              <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Tooltip title="Edit Profile">
                      <IconButton 
                        sx={{ 
                          backgroundColor: theme.palette.primary.main,
                          color: '#fff',
                          '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                          }
                        }}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <Avatar
                    sx={{
                      width: { xs: 80, md: 120 },
                      height: { xs: 80, md: 120 },
                      bgcolor: theme.palette.primary.main,
                      fontSize: { xs: 32, md: 42 },
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      border: '4px solid white',
                    }}
                  >
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </Avatar>
                </Badge>
                
                <Box sx={{ ml: { xs: 0, md: 4 }, mt: { xs: 2, md: 0 }, width: { xs: '100%', md: 'auto' } }}>
                  <Typography 
                    variant="h3" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 700,
                      fontSize: { xs: '2rem', md: '2.5rem' },
                      backgroundImage: `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      backgroundClip: 'text',
                      textFillColor: 'transparent',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    <Chip 
                      icon={<PersonIcon fontSize="small" />} 
                      label={user?.email} 
                      variant="outlined" 
                      size="medium"
                      sx={{ borderRadius: 2 }}
                    />
                    {user?.role && (
                      <Chip 
                        icon={<SchoolIcon fontSize="small" />} 
                        label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                        color="primary" 
                        size="medium"
                        sx={{ borderRadius: 2 }}
                      />
                    )}
                    {profile?.memberSince && (
                      <Chip 
                        label={`Member since ${new Date(profile.memberSince).toLocaleDateString()}`} 
                        variant="outlined" 
                        size="medium"
                        sx={{ borderRadius: 2 }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Learning Progress */}
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TimelineIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" fontWeight={600}>
                  Learning Progress
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={500}>Algebra</Typography>
                      <Typography variant="subtitle1" color="primary">{progressData.algebra}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={progressData.algebra} 
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        '& .MuiLinearProgress-bar': {
                          backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                          borderRadius: 5
                        }
                      }} 
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={500}>Calculus</Typography>
                      <Typography variant="subtitle1" color="primary">{progressData.calculus}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={progressData.calculus} 
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        '& .MuiLinearProgress-bar': {
                          backgroundImage: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
                          borderRadius: 5
                        }
                      }} 
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={500}>Geometry</Typography>
                      <Typography variant="subtitle1" color="primary">{progressData.geometry}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={progressData.geometry} 
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        '& .MuiLinearProgress-bar': {
                          backgroundImage: `linear-gradient(90deg, #ff9800, #ffb74d)`,
                          borderRadius: 5
                        }
                      }} 
                    />
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrophyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" fontWeight={600}>
                  Achievements
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                {achievements.map((achievement, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card 
                      elevation={1} 
                      sx={{ 
                        borderRadius: 3,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        }
                      }}
                    >
                      <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            backgroundColor: theme.palette.primary.main,
                            color: '#fff',
                            mr: 2,
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                          }}
                        >
                          {achievement.icon}
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {achievement.name} {achievement.level > 0 && `(Level ${achievement.level})`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {achievement.description}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Learning Stats */}
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" fontWeight={600}>
                  Learning Summary
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 3,
                      background: theme.palette.mode === 'dark' 
                        ? 'linear-gradient(135deg, rgba(20, 30, 48, 0.5) 0%, rgba(30, 40, 60, 0.5) 100%)'
                        : 'rgba(25, 118, 210, 0.05)',
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 55,
                          height: 55,
                          borderRadius: '50%',
                          backgroundColor: 'rgba(25, 118, 210, 0.15)',
                          mr: 2,
                        }}
                      >
                        <CalculateIcon color="primary" fontSize="large" />
                      </Box>
                      <Box>
                        <Typography variant="h3" fontWeight={700} color="primary">
                          {profile?.learningSummary?.problemsSolved || 0}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {t('profile.problemsSolved')}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2, textAlign: 'right' }}>
                      <Button
                        endicon={<ArrowIcon />}
                        onClick={() => navigate('/solver/history')}
                        sx={{ fontWeight: 500 }}
                      >
                        {t('profile.viewHistory')}
                      </Button>
                    </Box>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 3,
                      background: theme.palette.mode === 'dark' 
                        ? 'linear-gradient(135deg, rgba(20, 30, 48, 0.5) 0%, rgba(30, 40, 60, 0.5) 100%)'
                        : 'rgba(25, 118, 210, 0.05)',
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 55,
                          height: 55,
                          borderRadius: '50%',
                          backgroundColor: 'rgba(25, 118, 210, 0.15)',
                          mr: 2,
                        }}
                      >
                        <MenuBookIcon color="primary" fontSize="large" />
                      </Box>
                      <Box>
                        <Typography variant="h3" fontWeight={700} color="primary">
                          {profile?.learningSummary?.lessonsCompleted || 0}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {t('profile.lessonsCompleted')}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2, textAlign: 'right' }}>
                      <Button
                        endicon={<ArrowIcon />}
                        onClick={() => navigate('/lessons')}
                        sx={{ fontWeight: 500 }}
                      >
                        {t('profile.viewLessons')}
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" fontWeight={600}>
                  {t('profile.recentActivity')}
                </Typography>
              </Box>
              
              {profile?.recentActivity?.length > 0 ? (
                <Grid container spacing={2}>
                  {profile.recentActivity.map((activity, index) => (
                    <Grid item xs={12} md={6} lg={4} key={activity._id || index}>
                      <Card 
                        elevation={1} 
                        sx={{ 
                          borderRadius: 3,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                          }
                        }}
                        onClick={() => handleActivityClick(activity.type, activity._id)}
                      >
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 50,
                              height: 50,
                              borderRadius: '50%',
                              backgroundColor: 
                                activity.type === 'lesson' ? 'rgba(103, 58, 183, 0.1)' :
                                activity.type === 'practice' ? 'rgba(233, 30, 99, 0.1)' :
                                'rgba(0, 150, 136, 0.1)',
                              mr: 2,
                            }}
                          >
                            {activity.type === 'lesson' && <MenuBookIcon sx={{ color: '#673ab7' }} />}
                            {activity.type === 'practice' && <SchoolIcon sx={{ color: '#e91e63' }} />}
                            {activity.type === 'solution' && <CalculateIcon sx={{ color: '#009688' }} />}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {activity.title}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}
                            >
                              <Chip 
                                label={
                                  activity.type === 'lesson' ? 'Lesson' :
                                  activity.type === 'practice' ? 'Practice' :
                                  'Solution'
                                }
                                size="small"
                                color={
                                  activity.type === 'lesson' ? 'secondary' :
                                  activity.type === 'practice' ? 'error' :
                                  'success'
                                }
                                sx={{ 
                                  height: 20,
                                  '& .MuiChip-label': { px: 1, py: 0 }
                                }}
                              />
                              <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 4, 
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary">
                    {t('profile.noRecentActivity')}
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => navigate('/lessons')}
                    sx={{ mt: 2 }}
                  >
                    Start Learning
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProfilePage; 