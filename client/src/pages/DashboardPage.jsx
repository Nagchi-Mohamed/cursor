import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  School as SchoolIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as EmojiEventsIcon,
  MenuBook as MenuBookIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import ProgressService from '../services/ProgressService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DashboardPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overallProgress, setOverallProgress] = useState(null);
  const [topicPerformance, setTopicPerformance] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [learningStats, setLearningStats] = useState(null);
  const [achievements, setAchievements] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        progressData,
        topicData,
        activityData,
        recommendationsData,
        statsData,
        achievementsData,
      ] = await Promise.all([
        ProgressService.getOverallProgress(),
        ProgressService.getTopicPerformance(),
        ProgressService.getRecentActivity(),
        ProgressService.getRecommendations(),
        ProgressService.getLearningStats(),
        ProgressService.getAchievements(),
      ]);

      setOverallProgress(progressData);
      setTopicPerformance(topicData);
      setRecentActivity(activityData);
      setRecommendations(recommendationsData);
      setLearningStats(statsData);
      setAchievements(achievementsData);
    } catch (err) {
      setError(t('errors.serverError'));
      console.error('Error loading dashboard data:', err);
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
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('nav.dashboard')}
      </Typography>

      {/* Learning Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{t('dashboard.lessonsCompleted')}</Typography>
              </Box>
              <Typography variant="h4">{learningStats?.lessonsCompleted || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">{t('dashboard.practiceSetsMastered')}</Typography>
              </Box>
              <Typography variant="h4">{learningStats?.practiceSetsMastered || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalculateIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">{t('dashboard.problemsSolved')}</Typography>
              </Box>
              <Typography variant="h4">{learningStats?.problemsSolved || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimerIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">{t('dashboard.timeSpent')}</Typography>
              </Box>
              <Typography variant="h4">{learningStats?.timeSpent || '0h'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Topic Performance Chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('dashboard.topicPerformance')}
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topicPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#ccc'} />
              <XAxis 
                dataKey="topic" 
                stroke={darkMode ? '#fff' : '#666'}
                tick={{ fill: darkMode ? '#fff' : '#666' }}
              />
              <YAxis 
                stroke={darkMode ? '#fff' : '#666'}
                tick={{ fill: darkMode ? '#fff' : '#666' }}
              />
              <RechartsTooltip 
                contentStyle={{
                  backgroundColor: darkMode ? '#333' : '#fff',
                  border: 'none',
                  borderRadius: 8,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
                labelStyle={{ color: darkMode ? '#fff' : '#666' }}
              />
              <Bar dataKey="score" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Recent Activity and Recommendations */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.recentActivity')}
            </Typography>
            {recentActivity.length > 0 ? (
              <List>
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={activity._id}>
                    <ListItem
                      button
                      onClick={() => handleActivityClick(activity.type, activity._id)}
                      sx={{
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      <ListItemIcon>
                        {activity.type === 'lesson' && <MenuBookIcon />}
                        {activity.type === 'practice' && <SchoolIcon />}
                        {activity.type === 'solution' && <CalculateIcon />}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.title}
                        secondary={new Date(activity.timestamp).toLocaleDateString()}
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                {t('dashboard.noRecentActivity')}
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.recommendations')}
            </Typography>
            {recommendations?.nextLesson && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('dashboard.continueLearning')}
                  </Typography>
                  <Typography variant="body1">
                    {recommendations.nextLesson.title}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={() => navigate(`/lessons/${recommendations.nextLesson._id}`)}
                  >
                    {t('actions.continue')}
                  </Button>
                </CardContent>
              </Card>
            )}
            {recommendations?.practiceSets?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {t('dashboard.recommendedPractice')}
                </Typography>
                {recommendations.practiceSets.map((set) => (
                  <Chip
                    key={set._id}
                    label={set.title}
                    onClick={() => navigate(`/practice/${set._id}`)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Achievements */}
      {achievements && (
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            {t('dashboard.achievements')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EmojiEventsIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5">
              {t('dashboard.points', { points: achievements.points })}
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {achievements.badges.map((badge) => (
              <Grid item key={badge._id}>
                <Tooltip title={badge.description}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Avatar
                        src={badge.icon}
                        alt={badge.name}
                        sx={{ width: 64, height: 64, mx: 'auto', mb: 1 }}
                      />
                      <Typography variant="subtitle1">{badge.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {badge.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default DashboardPage; 