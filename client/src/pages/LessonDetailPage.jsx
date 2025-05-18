import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Breadcrumbs,
  Link,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Rating,
  Divider,
  IconButton,
  Snackbar,
  useTheme,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Feedback as FeedbackIcon,
  School as SchoolIcon,
  Calculate as CalculateIcon,
  CheckCircle as CheckCircleIcon,
  Timer as TimerIcon,
  Person as PersonIcon,
  Update as UpdateIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import LessonService from '../services/LessonService';
import PracticeSetService from '../services/PracticeSetService';
import ProgressService from '../services/ProgressService';
import renderMathInElement from '../utils/renderMathInElement';
import FeedbackModal from '../components/feedback/FeedbackModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import 'katex/dist/katex.min.css';

const LessonDetailPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [practiceSets, setPracticeSets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPracticeSets, setIsLoadingPracticeSets] = useState(true);
  const [error, setError] = useState(null);
  const [practiceSetsError, setPracticeSetsError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const contentRef = useRef(null);

  const fetchLesson = useCallback(async () => {
    if (!lessonId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await LessonService.getById(lessonId);
      setLesson(response.data);
      if (response.data.userRating) {
        setUserRating(response.data.userRating);
      }
      if (user) {
        const progress = await ProgressService.getLessonProgress(lessonId);
        setIsCompleted(progress?.completed || false);
      }
    } catch (err) {
      console.error(`Failed to fetch lesson ${lessonId}:`, err);
      setError(err.response?.data?.message || err.message || t('errors.lessonLoadFailed'));
      setSnackbar({
        open: true,
        message: t('errors.lessonLoadFailed'),
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [lessonId, user, t]);

  const fetchPracticeSets = useCallback(async () => {
    if (!lessonId) return;
    setIsLoadingPracticeSets(true);
    setPracticeSetsError(null);
    try {
      const response = await PracticeSetService.getByLesson(lessonId);
      setPracticeSets(response.data);
    } catch (err) {
      console.error(`Failed to fetch practice sets for lesson ${lessonId}:`, err);
      setPracticeSetsError(err.response?.data?.message || err.message || t('errors.practiceSetsLoadFailed'));
    } finally {
      setIsLoadingPracticeSets(false);
    }
  }, [lessonId, t]);

  useEffect(() => {
    fetchLesson();
    fetchPracticeSets();
  }, [fetchLesson, fetchPracticeSets]);

  // Effect for KaTeX rendering
  useEffect(() => {
    if (lesson && lesson.content && contentRef.current) {
      const timer = setTimeout(() => {
        if (contentRef.current) {
          renderMathInElement(contentRef.current);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [lesson]);

  const handleRatingChange = async (event, newValue) => {
    if (!user) {
      setSnackbar({
        open: true,
        message: t('errors.loginRequired'),
        severity: 'warning',
      });
      return;
    }

    try {
      await LessonService.rateLesson(lessonId, newValue);
      setUserRating(newValue);
      setSnackbar({
        open: true,
        message: t('success.ratingSubmitted'),
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: t('errors.ratingFailed'),
        severity: 'error',
      });
    }
  };

  const handleMarkComplete = async () => {
    if (!user) {
      setSnackbar({
        open: true,
        message: t('errors.loginRequired'),
        severity: 'warning',
      });
      return;
    }

    try {
      await ProgressService.markLessonComplete(lessonId);
      setIsCompleted(true);
      setSnackbar({
        open: true,
        message: t('success.lessonCompleted'),
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: t('errors.completionFailed'),
        severity: 'error',
      });
    }
  };

  const handleRelatedContentClick = (type, id) => {
    switch (type) {
      case 'practice':
        navigate(`/practice/${id}`);
        break;
      case 'lesson':
        navigate(`/lessons/${id}`);
        break;
      default:
        break;
    }
  };

  if (isLoading) {
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

  if (error) {
    return (
      <Container>
        <Alert 
          severity="error" 
          sx={{ mt: 3 }}
          role="alert"
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (!lesson) {
    return (
      <Container>
        <Alert 
          severity="info" 
          sx={{ mt: 3 }}
          role="status"
        >
          {t('lessons.notFound')}
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 3 }}>
      <Breadcrumbs 
        aria-label={t('common.breadcrumbs')} 
        sx={{ mb: 2 }}
      >
        <Link 
          component={RouterLink} 
          underline="hover" 
          color="inherit" 
          to="/"
          aria-label={t('nav.home')}
        >
          {t('nav.home')}
        </Link>
        <Link 
          component={RouterLink} 
          underline="hover" 
          color="inherit" 
          to="/lessons"
          aria-label={t('nav.lessons')}
        >
          {t('nav.lessons')}
        </Link>
        <Typography color="text.primary">{lesson.title}</Typography>
      </Breadcrumbs>

      <Box 
        display="flex" 
        alignItems="center" 
        mb={3}
        sx={{
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Box display="flex" alignItems="center">
          <IconButton 
            onClick={() => navigate(-1)} 
            sx={{ mr: 2 }}
            aria-label={t('actions.goBack')}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{
              color: theme.palette.text.primary,
              transition: theme.transitions.create(['color']),
            }}
          >
            {lesson.title}
          </Typography>
        </Box>
        <Box sx={{ ml: { sm: 'auto' } }}>
          <Tooltip title={t('actions.provideFeedback')}>
            <IconButton
              color="primary"
              onClick={() => setFeedbackOpen(true)}
              aria-label={t('actions.provideFeedback')}
            >
              <FeedbackIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4,
          backgroundColor: theme.palette.background.paper,
          transition: theme.transitions.create(['background-color']),
        }}
      >
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <SchoolIcon color="primary" />
              <Typography variant="body2" color="text.secondary">
                {t('lessons.category')}: {lesson.category}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <StarIcon color="primary" />
              <Typography variant="body2" color="text.secondary">
                {t('lessons.difficulty')}: {lesson.difficulty}
              </Typography>
            </Box>
          </Grid>
          {lesson.estimatedTime && (
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <TimerIcon color="primary" />
                <Typography variant="body2" color="text.secondary">
                  {t('lessons.estimatedTime')}: {lesson.estimatedTime} {t('common.minutes')}
                </Typography>
              </Box>
            </Grid>
          )}
          {lesson.author && (
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <PersonIcon color="primary" />
                <Typography variant="body2" color="text.secondary">
                  {t('lessons.author')}: {lesson.author}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        <Box 
          display="flex" 
          alignItems="center" 
          mb={2}
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Box display="flex" alignItems="center">
            <Rating
              value={userRating}
              onChange={handleRatingChange}
              precision={0.5}
              size="large"
              aria-label={t('lessons.rateLesson')}
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({lesson.ratingCount || 0} {t('lessons.ratings')})
            </Typography>
          </Box>
          {user && (
            <Button
              variant={isCompleted ? "outlined" : "contained"}
              color={isCompleted ? "success" : "primary"}
              startIcon={isCompleted ? <CheckCircleIcon /> : null}
              onClick={handleMarkComplete}
              sx={{ ml: { sm: 'auto' } }}
              aria-label={isCompleted ? t('lessons.completed') : t('lessons.markComplete')}
            >
              {isCompleted ? t('lessons.completed') : t('lessons.markComplete')}
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box 
          ref={contentRef}
          sx={{
            '& .katex': {
              fontSize: '1.1em',
              color: theme.palette.text.primary,
            },
            '& .katex-display': {
              margin: '1em 0',
              overflowX: 'auto',
              overflowY: 'hidden',
            },
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 1,
              my: 2,
            },
            '& pre': {
              backgroundColor: theme.palette.background.default,
              p: 2,
              borderRadius: 1,
              overflowX: 'auto',
            },
            '& code': {
              backgroundColor: theme.palette.background.default,
              p: 0.5,
              borderRadius: 0.5,
            },
            '& blockquote': {
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              pl: 2,
              py: 1,
              my: 2,
              backgroundColor: theme.palette.background.default,
            },
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
        </Box>
      </Paper>

      <Typography 
        variant="h5" 
        gutterBottom
        sx={{
          color: theme.palette.text.primary,
          transition: theme.transitions.create(['color']),
        }}
      >
        {t('lessons.practiceSets')}
      </Typography>

      {isLoadingPracticeSets ? (
        <Box 
          display="flex" 
          justifyContent="center" 
          my={3}
          role="progressbar"
          aria-label={t('common.loading')}
        >
          <CircularProgress />
        </Box>
      ) : practiceSetsError ? (
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          role="alert"
        >
          {practiceSetsError}
        </Alert>
      ) : practiceSets.length === 0 ? (
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ mt: 2 }}
        >
          {t('lessons.noPracticeSets')}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {practiceSets.map((practiceSet) => (
            <Grid item xs={12} sm={6} md={4} key={practiceSet._id}>
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
                    <CalculateIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h2">
                      {practiceSet.title}
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
                    {practiceSet.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip 
                      label={`${practiceSet.questions.length} ${t('practice.questions')}`} 
                      size="small" 
                      sx={{ mr: 1 }} 
                    />
                    <Chip 
                      label={`${practiceSet.totalPoints} ${t('practice.points')}`} 
                      size="small" 
                      color="primary" 
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    component={RouterLink}
                    to={`/practice/${practiceSet._id}`}
                    aria-label={t('practice.startPractice')}
                  >
                    {t('practice.startPractice')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {lesson.relatedContent && (
        <Paper 
          sx={{ 
            p: 3, 
            mt: 4,
            backgroundColor: theme.palette.background.paper,
            transition: theme.transitions.create(['background-color']),
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{
              color: theme.palette.text.primary,
              transition: theme.transitions.create(['color']),
            }}
          >
            {t('lessons.relatedContent')}
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {lesson.relatedContent.practiceSets?.length > 0 && (
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                {t('lessons.relatedPracticeSets')}
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {lesson.relatedContent.practiceSets.map((set) => (
                  <Chip
                    key={set._id}
                    icon={<SchoolIcon />}
                    label={set.title}
                    onClick={() => handleRelatedContentClick('practice', set._id)}
                    clickable
                    aria-label={t('lessons.viewPracticeSet', { title: set.title })}
                  />
                ))}
              </Box>
            </Box>
          )}

          {lesson.relatedContent.lessons?.length > 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {t('lessons.relatedLessons')}
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {lesson.relatedContent.lessons.map((relatedLesson) => (
                  <Chip
                    key={relatedLesson._id}
                    icon={<CalculateIcon />}
                    label={relatedLesson.title}
                    onClick={() => handleRelatedContentClick('lesson', relatedLesson._id)}
                    clickable
                    aria-label={t('lessons.viewLesson', { title: relatedLesson.title })}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      )}

      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        context={{
          type: 'lesson',
          contentId: lessonId,
          pageUrl: window.location.pathname,
        }}
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

export default LessonDetailPage; 