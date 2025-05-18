import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Rating,
  Tooltip,
  useTheme,
  IconButton,
  Snackbar,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  Timer as TimerIcon,
  Star as StarIcon,
  Search as SearchIcon,
  Feedback as FeedbackIcon,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material';
import LessonService from '../services/LessonService';
import FeedbackModal from '../components/feedback/FeedbackModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const categories = [
  'Algebra',
  'Calculus',
  'Geometry',
  'Statistics',
  'Trigonometry',
  'Linear Algebra',
];

const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced'];

const LessonsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadLessons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await LessonService.getLessons();
      setLessons(data);
      setFilteredLessons(data);
    } catch (err) {
      console.error('Error loading lessons:', err);
      setError(t('errors.loadLessonsFailed'));
      setSnackbar({
        open: true,
        message: t('errors.loadLessonsFailed'),
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  const filterLessons = useCallback(() => {
    let filtered = [...(lessons || [])];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (lesson) =>
          lesson.title.toLowerCase().includes(searchLower) ||
          lesson.description.toLowerCase().includes(searchLower) ||
          lesson.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((lesson) => lesson.category === selectedCategory);
    }

    // Apply difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter((lesson) => lesson.difficulty === selectedDifficulty);
    }

    setFilteredLessons(filtered);
  }, [lessons, searchTerm, selectedCategory, selectedDifficulty]);

  useEffect(() => {
    filterLessons();
  }, [filterLessons]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleDifficultyChange = (event) => {
    setSelectedDifficulty(event.target.value);
  };

  const handleStartLesson = (lessonId) => {
    navigate(`/lessons/${lessonId}`);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedDifficulty('');
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        role="progressbar"
        aria-label={t('common.loading')}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={4}
      >
        <Typography 
          variant="h4" 
          component="h1"
          sx={{
            color: theme.palette.text.primary,
            transition: theme.transitions.create(['color']),
          }}
        >
          {t('nav.lessons')}
        </Typography>
        <Tooltip title={t('actions.provideFeedback')}>
          <span>
            <IconButton
              color="primary"
              onClick={() => setFeedbackOpen(true)}
              aria-label={t('actions.provideFeedback')}
            >
              <FeedbackIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('lessons.searchPlaceholder')}
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            aria-label={t('lessons.searchPlaceholder')}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.background.default,
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>{t('lessons.category')}</InputLabel>
            <Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              label={t('lessons.category')}
              aria-label={t('lessons.category')}
            >
              <MenuItem value="">{t('lessons.allCategories')}</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>{t('lessons.difficulty')}</InputLabel>
            <Select
              value={selectedDifficulty}
              onChange={handleDifficultyChange}
              label={t('lessons.difficulty')}
              aria-label={t('lessons.difficulty')}
            >
              <MenuItem value="">{t('lessons.allLevels')}</MenuItem>
              {difficultyLevels.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {(selectedCategory || selectedDifficulty || searchTerm) && (
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t('lessons.filteredResults', { count: filteredLessons.length })}
          </Typography>
          <Button
            size="small"
            onClick={handleClearFilters}
            aria-label={t('actions.clearFilters')}
          >
            {t('actions.clearFilters')}
          </Button>
        </Box>
      )}

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 4 }}
          role="alert"
        >
          {error}
        </Alert>
      )}

  {!loading && (!filteredLessons || filteredLessons.length === 0) ? (
    <Alert 
      severity="info"
      sx={{ mb: 4 }}
      role="status"
    >
      {t('lessons.noLessonsFound')}
    </Alert>
  ) : (
        <Grid container spacing={3}>
          {filteredLessons.map((lesson) => (
            <Grid item xs={12} sm={6} md={4} key={lesson._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: theme.transitions.create(['box-shadow', 'transform']),
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MenuBookIcon sx={{ mr: 1 }} />
                    <Typography 
                      variant="h6" 
                      component="h2"
                      sx={{
                        color: theme.palette.text.primary,
                        transition: theme.transitions.create(['color']),
                      }}
                    >
                      {lesson.title}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    paragraph
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {lesson.description}
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                    <Chip
                      icon={<SchoolIcon />}
                      label={lesson.category}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategory(lesson.category);
                      }}
                    aria-label={`${t('lessons.filterByCategory')}.${lesson.category}`}
                    />
                    <Chip
                      icon={<StarIcon />}
                      label={lesson.difficulty}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDifficulty(lesson.difficulty);
                      }}
                    aria-label={`${t('lessons.filterByDifficulty')}.${lesson.difficulty}`}
                    />
                    {lesson.estimatedTime && (
                      <Chip
                        icon={<TimerIcon />}
                        label={`${lesson.estimatedTime} ${t('common.minutes')}`}
                        size="small"
                      />
                    )}
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {t('lessons.rating')}:
                    </Typography>
                    <Rating
                      value={lesson.averageRating || 0}
                      precision={0.5}
                      size="small"
                      readOnly
                      aria-label={t('lessons.averageRating', { rating: lesson.averageRating || 0 })}
                    />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({lesson.ratingCount || 0})
                    </Typography>
                  </Box>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleStartLesson(lesson._id)}
                    aria-label={t('lessons.startLesson')}
                  >
                    {t('lessons.startLesson')}
                  </Button>
                  <Tooltip title={t('lessons.viewDetails')}>
                    <span>
                      <Button
                        size="small"
                        onClick={() => navigate(`/lessons/${lesson._id}/details`)}
                        aria-label={t('lessons.viewDetails')}
                      >
                        {t('lessons.details')}
                      </Button>
                    </span>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        context={{ type: 'general', pageUrl: window.location.pathname }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LessonsPage; 