import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Lightbulb as HintIcon,
  CheckCircle as CorrectIcon,
  Cancel as IncorrectIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { practiceService } from '../services/practiceService';
import { formatTime } from '../utils/timeUtils';
import MultipleChoiceQuestion from '../components/practice/MultipleChoiceQuestion';
import FillInTheBlankQuestion from '../components/practice/FillInTheBlankQuestion';
import EquationQuestion from '../components/practice/EquationQuestion';

/**
 * PracticeSetPage component for interactive practice sessions
 * @returns {JSX.Element} The PracticeSetPage component
 */
const PracticeSetPage = () => {
  const { setId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useLanguage();
  const { user } = useAuth();

  // State management
  const [practiceSet, setPracticeSet] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [results, setResults] = useState(null);

  // Fetch practice set data
  useEffect(() => {
    const fetchPracticeSet = async () => {
      try {
        setLoading(true);
        const data = await practiceService.getPracticeSet(setId);
        setPracticeSet(data);
        setTimeRemaining(data.timeLimit || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPracticeSet();
  }, [setId]);

  // Timer effect
  useEffect(() => {
    if (!timeRemaining) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishPractice();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleAnswerSubmit = async () => {
    if (!practiceSet) return;

    const currentQuestion = practiceSet.questions[currentQuestionIndex];
    const userAnswer = answers[currentQuestionIndex];

    try {
      const result = await practiceService.submitAnswer(setId, currentQuestion.id, userAnswer);
      setFeedback(result);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < practiceSet.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setFeedback(null);
      setShowHint(false);
    } else {
      handleFinishPractice();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setFeedback(null);
      setShowHint(false);
    }
  };

  const handleFinishPractice = async () => {
    try {
      const results = await practiceService.submitPracticeSet(setId, answers);
      setResults(results);
      setResultsOpen(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAnswerChange = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: value,
    }));
  };

  const renderQuestionInput = () => {
    if (!practiceSet) return null;

    const currentQuestion = practiceSet.questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestionIndex];

    switch (currentQuestion.type) {
      case 'multiple_choice':
        return (
          <MultipleChoiceQuestion
            question={currentQuestion}
            value={currentAnswer}
            onChange={handleAnswerChange}
          />
        );
      case 'fill_in_blank':
        return (
          <FillInTheBlankQuestion
            question={currentQuestion}
            value={currentAnswer}
            onChange={handleAnswerChange}
          />
        );
      case 'equation':
        return (
          <EquationQuestion
            question={currentQuestion}
            value={currentAnswer}
            onChange={handleAnswerChange}
          />
        );
      default:
        return (
          <Typography color="error">
            {t('practice.unsupportedQuestionType')}
          </Typography>
        );
    }
  };

  const renderResults = () => {
    if (!results) return null;

    const score = (results.correctAnswers / results.totalQuestions) * 100;

    return (
      <>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <TrophyIcon
            sx={{
              fontSize: 64,
              color: score >= 70 ? 'success.main' : 'warning.main',
              mb: 2,
            }}
          />
          <Typography variant="h4" gutterBottom>
            {t('practice.score', { score: Math.round(score) })}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('practice.correctAnswers', {
              correct: results.correctAnswers,
              total: results.totalQuestions,
            })}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          {t('practice.questionReview')}
        </Typography>
        <List>
          {practiceSet.questions.map((question, index) => {
            const answer = answers[index];
            const isCorrect = results.questionResults[index]?.correct;

            return (
              <ListItem
                key={index}
                sx={{
                  bgcolor: isCorrect ? 'success.light' : 'error.light',
                  mb: 1,
                  borderRadius: 1,
                }}
              >
                <ListItemIcon>
                  {isCorrect ? <CorrectIcon /> : <IncorrectIcon />}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      component="div"
                      dangerouslySetInnerHTML={{ __html: question.text }}
                    />
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        {t('practice.yourAnswer')}: {answer}
                      </Typography>
                      {!isCorrect && (
                        <Typography variant="body2">
                          {t('practice.correctAnswer')}: {question.correctAnswer}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </>
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/practice')}
          sx={{ mt: 2 }}
        >
          {t('common.backToPractice')}
        </Button>
      </Container>
    );
  }

  if (!practiceSet) {
    return null;
  }

  const currentQuestion = practiceSet.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / practiceSet.questions.length) * 100;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {practiceSet.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1">
            {t('practice.question', {
              current: currentQuestionIndex + 1,
              total: practiceSet.questions.length,
            })}
          </Typography>
          {timeRemaining && (
            <Typography variant="body1" color="primary">
              {formatTime(timeRemaining)}
            </Typography>
          )}
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ mt: 1 }}
          aria-label={t('practice.progress')}
        />
      </Box>

      {/* Question Card */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          position: 'relative',
        }}
      >
        {/* Question Content */}
        <Typography
          variant="h6"
          component="div"
          sx={{ mb: 2 }}
          dangerouslySetInnerHTML={{ __html: currentQuestion.text }}
        />

        {/* Answer Input Area */}
        <Box sx={{ mb: 3 }}>
          {renderQuestionInput()}
        </Box>

        {/* Hint Area */}
        {showHint && currentQuestion.hint && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 1,
              bgcolor: 'info.light',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <HintIcon />
            <Typography
              component="div"
              dangerouslySetInnerHTML={{ __html: currentQuestion.hint }}
            />
          </Box>
        )}

        {/* Feedback Area */}
        {feedback && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 1,
              bgcolor: feedback.correct
                ? 'success.light'
                : 'error.light',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
            role="alert"
            aria-live="polite"
          >
            {feedback.correct ? <CorrectIcon /> : <IncorrectIcon />}
            <Typography>
              {feedback.correct
                ? t('practice.correct')
                : t('practice.incorrect')}
            </Typography>
          </Box>
        )}

        {/* Controls */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 3,
            gap: 2,
          }}
        >
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              {t('common.previous')}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title={t('practice.hint')}>
              <IconButton
                onClick={() => setShowHint(!showHint)}
                disabled={!currentQuestion.hint}
              >
                <HintIcon />
              </IconButton>
            </Tooltip>

            {!feedback ? (
              <Button
                variant="contained"
                onClick={handleAnswerSubmit}
                disabled={!answers[currentQuestionIndex]}
              >
                {t('practice.submit')}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNextQuestion}
                endicon={<ArrowForwardIcon />}
              >
                {currentQuestionIndex === practiceSet.questions.length - 1
                  ? t('practice.finish')
                  : t('common.next')}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Results Dialog */}
      <Dialog
        open={resultsOpen}
        onClose={() => setResultsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('practice.results')}</DialogTitle>
        <DialogContent>
          {renderResults()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultsOpen(false)}>
            {t('common.close')}
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/practice')}
          >
            {t('practice.backToPractice')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PracticeSetPage; 