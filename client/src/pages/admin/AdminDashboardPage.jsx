import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  People as PeopleIcon,
  Book as BookIcon,
  Assignment as AssignmentIcon,
  Forum as ForumIcon,
  Feedback as FeedbackIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { adminStatsService } from '../../services/adminStatsService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon: Icon, loading, error }) => (
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Icon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" color="textSecondary">
          {title}
        </Typography>
      </Box>
      {loading ? (
        <CircularProgress size={24} sx={{ m: 'auto' }} />
      ) : error ? (
        <Typography color="error">Error loading data</Typography>
      ) : (
        <Typography variant="h4" component="div" sx={{ mt: 'auto' }}>
          {value}
        </Typography>
      )}
    </Paper>
  </Grid>
);

const TrendChart = ({ data, title, color }) => (
  <Box sx={{ width: '100%', height: 300, p: 2 }}>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <ResponsiveContainer>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="_id" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke={color} />
      </LineChart>
    </ResponsiveContainer>
  </Box>
);

const AdminDashboardPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await adminStatsService.getPlatformStats();
        setStats(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Error fetching statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickLinks = [
    { title: t('admin.quickLinks.lessons'), path: '/admin/lessons', icon: BookIcon },
    { title: t('admin.quickLinks.users'), path: '/admin/users', icon: PeopleIcon },
    { title: t('admin.quickLinks.practice'), path: '/admin/practice-sets', icon: AssignmentIcon },
    { title: t('admin.quickLinks.feedback'), path: '/admin/feedback', icon: FeedbackIcon },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('admin.dashboard.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <StatCard
          title={t('admin.dashboard.totalUsers')}
          value={stats?.stats.totalUsers || 0}
          icon={PeopleIcon}
          loading={loading}
          error={error}
        />
        <StatCard
          title={t('admin.dashboard.newUsers')}
          value={stats?.stats.newUsersLast7Days || 0}
          icon={TrendingUpIcon}
          loading={loading}
          error={error}
        />
        <StatCard
          title={t('admin.dashboard.totalLessons')}
          value={stats?.stats.totalLessons || 0}
          icon={BookIcon}
          loading={loading}
          error={error}
        />
        <StatCard
          title={t('admin.dashboard.publishedLessons')}
          value={stats?.stats.publishedLessons || 0}
          icon={BookIcon}
          loading={loading}
          error={error}
        />
        <StatCard
          title={t('admin.dashboard.totalPracticeSets')}
          value={stats?.stats.totalPracticeSets || 0}
          icon={AssignmentIcon}
          loading={loading}
          error={error}
        />
        <StatCard
          title={t('admin.dashboard.forumActivity')}
          value={`${stats?.stats.totalForumThreads || 0} / ${stats?.stats.totalForumPosts || 0}`}
          icon={ForumIcon}
          loading={loading}
          error={error}
        />
        <StatCard
          title={t('admin.dashboard.pendingFeedback')}
          value={stats?.stats.pendingFeedbackCount || 0}
          icon={FeedbackIcon}
          loading={loading}
          error={error}
        />
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          {t('admin.dashboard.quickLinks')}
        </Typography>
        <Grid container spacing={2}>
          {quickLinks.map((link) => (
            <Grid item key={link.path} xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<link.icon />}
                fullWidth
                onClick={() => navigate(link.path)}
                sx={{ justifyContent: 'flex-start', py: 1.5 }}
              >
                {link.title}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {!loading && !error && stats?.trends && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper>
              <TrendChart
                data={stats.trends.userRegistration}
                title={t('admin.dashboard.userTrend')}
                color="#2196f3"
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper>
              <TrendChart
                data={stats.trends.contentCreation}
                title={t('admin.dashboard.contentTrend')}
                color="#4caf50"
              />
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminDashboardPage; 