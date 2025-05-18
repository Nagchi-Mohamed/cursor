import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Rating,
  Tooltip,
  useTheme,
  IconButton,
  Snackbar,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Feedback as FeedbackIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import PracticeService from '../services/PracticeService';
import FeedbackModal from '../components/feedback/FeedbackModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const PracticePage = () => {
  const { setId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [practiceSet, setPracticeSet] = useState(null);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [progress, setProgress] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const loadPracticeSet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PracticeService.getPracticeSet(setId);
      setPracticeSet(data);
      if (data.problems && data.problems.length > 0) {
        setCurrentProblem(data.problems[0]);
      }
    } catch (err) {
      console.error('Error loading practice set:', err);
      setError(t('errors.loadPracticeSetFailed'));
      setSnackbar({
        open: true,
        message: t('errors.loadPracticeSetFailed'),
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [setId, t]);

  useEffect(() => {
    loadPracticeSet();
  }, [loadPracticeSet]);

  const handleAnswerSubmit = (answer) => {
    setAnswers((prev) => ({
      ...prev,
      [currentProblem._id]: answer,
    }));

    const currentIndex = practiceSet.problems.findIndex(
      (p) => p._id === currentProblem._id
    );

    if (currentIndex < practiceSet.problems.length - 1) {
      setCurrentProblem(practiceSet.problems[currentIndex + 1]);
      setProgress(((currentIndex + 1) / practiceSet.problems.length) * 100);
    } else {
      setShowResults(true);
      setProgress(100);
    }
  };

  const handleBack = () => {
    navigate('/practice');
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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 4 }}
          role="alert"
        >
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          aria-label={t('actions.goBack')}
        >
          {t('actions.goBack')}
        </Button>
      </Container>
    );
  }

  if (!practiceSet) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="info"
          sx={{ mb: 4 }}
          role="status"
        >
          {t('practice.practiceSetNotFound')}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          aria-label={t('actions.goBack')}
        >
          {t('actions.goBack')}
        </Button>
      </Container>
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
        <Box display="flex" alignItems="center">
          <IconButton
            onClick={handleBack}
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
            {practiceSet.title}
          </Typography>
        </Box>
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

      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ mb: 4 }}
        aria-label={t('practice.progress')}
      />

      {showResults ? (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {t('practice.results')}
            </Typography>
            <Grid container spacing={2}>
              {practiceSet.problems.map((problem) => {
                const userAnswer = answers[problem._id];
                const isCorrect = userAnswer === problem.correctAnswer;
                return (
                  <Grid item xs={12} key={problem._id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                          {isCorrect ? (
                            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                          ) : (
                            <ErrorIcon color="error" sx={{ mr: 1 }} />
                          )}
                          <Typography variant="h6">
                            {problem.question}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {t('practice.yourAnswer')}: {userAnswer}
                        </Typography>
                        {!isCorrect && (
                          <Typography variant="body2" color="text.secondary">
                            {t('practice.correctAnswer')}: {problem.correctAnswer}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
            <Box mt={4} display="flex" justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                onClick={handleBack}
                aria-label={t('actions.finish')}
              >
                {t('actions.finish')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : currentProblem ? (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {currentProblem.question}
            </Typography>
            <Grid container spacing={2}>
              {currentProblem.options.map((option, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleAnswerSubmit(option)}
                    sx={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      p: 2,
                    }}
                    aria-label={t('practice.selectAnswer', { option })}
                  >
                    {option}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      ) : (
        <Alert 
          severity="info"
          sx={{ mb: 4 }}
          role="status"
        >
          {t('practice.noProblemsFound')}
        </Alert>
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

export default PracticePage; 