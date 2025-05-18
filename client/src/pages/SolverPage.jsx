import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid,
  CardMedia,
  Snackbar,
  useTheme,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import SolverService from '../services/SolverService';
import HistoryService from '../services/HistoryService';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import renderMathInElement from '../utils/renderMathInElement';

const SolverPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [latexInput, setLatexInput] = useState('');
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [solutionHistory, setSolutionHistory] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showHistory, setShowHistory] = useState(false);

  const fileInputRef = useRef(null);
  const audioChunksRef = useRef([]);
  const contentRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (contentRef.current && solution) {
      renderMathInElement(contentRef.current);
    }
  }, [solution]);

  useEffect(() => {
    return () => {
      if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder, isRecording]);

  const loadHistory = async () => {
    try {
      const history = await HistoryService.getRecentSolutions(5);
      setSolutionHistory(history);
    } catch (err) {
      console.error('Error loading solution history:', err);
      setSnackbar({
        open: true,
        message: t('errors.loadHistoryFailed'),
        severity: 'error',
      });
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSnackbar({
        open: true,
        message: t('errors.invalidFileType'),
        severity: 'error',
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    try {
      setLoading(true);
      const result = await SolverService.processImage(file);
      setLatexInput(result.latex);
      setSnackbar({
        open: true,
        message: t('success.imageProcessed'),
        severity: 'success',
      });
      // Focus the input after processing
      inputRef.current?.focus();
    } catch (err) {
      setSnackbar({
        open: true,
        message: t('errors.imageProcessingFailed'),
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        try {
          setLoading(true);
          const result = await SolverService.processVoiceInput(audioBlob);
          setLatexInput(result.latex);
          setSnackbar({
            open: true,
            message: t('success.voiceProcessed'),
            severity: 'success',
          });
          // Focus the input after processing
          inputRef.current?.focus();
        } catch (err) {
          setSnackbar({
            open: true,
            message: t('errors.voiceProcessingFailed'),
            severity: 'error',
          });
        } finally {
          setLoading(false);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      setSnackbar({
        open: true,
        message: t('errors.microphoneAccess'),
        severity: 'error',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleSolve = async () => {
    if (!latexInput.trim()) {
      setSnackbar({
        open: true,
        message: t('errors.emptyInput'),
        severity: 'warning',
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await SolverService.solveProblem(latexInput);
      setSolution(result);

      // Save to history if user is logged in
      if (user) {
        await HistoryService.saveSolution({
          problem: latexInput,
          solution: result,
          timestamp: new Date().toISOString(),
        });
        // Refresh history
        loadHistory();
      }
    } catch (err) {
      setError(t('errors.solvingFailed'));
      console.error('Error solving problem:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToHistory = async () => {
    if (!user) {
      setSnackbar({
        open: true,
        message: t('errors.loginRequired'),
        severity: 'warning',
      });
      return;
    }

    try {
      await HistoryService.saveSolution({
        problem: latexInput,
        solution,
        timestamp: new Date().toISOString(),
      });
      // Refresh history
      loadHistory();
      setSnackbar({
        open: true,
        message: t('success.solutionSaved'),
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: t('errors.saveFailed'),
        severity: 'error',
      });
    }
  };

  const handleHistoryItemClick = (item) => {
    setLatexInput(item.problem);
    setSolution(item.solution);
    setShowHistory(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={showHistory ? 8 : 12}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3,
              backgroundColor: theme.palette.background.paper,
              transition: theme.transitions.create(['background-color']),
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {t('nav.solver')}
              </Typography>
              <Tooltip title={t('actions.toggleHistory')}>
                <IconButton 
                  onClick={() => setShowHistory(!showHistory)}
                  color={showHistory ? 'primary' : 'default'}
                >
                  <HistoryIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <form onSubmit={(e) => { e.preventDefault(); handleSolve(); }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                label={t('solver.inputLabel')}
                placeholder={t('solver.inputPlaceholder')}
                value={latexInput}
                onChange={(e) => setLatexInput(e.target.value)}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.background.default,
                  },
                }}
                inputRef={inputRef}
                aria-label={t('solver.inputLabel')}
              />
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  aria-label={t('solver.uploadImage')}
                />
                <Button
                  variant="outlined"
                  startIcon={<PhotoCameraIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  aria-label={t('solver.uploadImage')}
                  data-testid="upload-image-button"
                >
                  {t('solver.uploadImage')}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={isRecording ? <MicOffIcon /> : <MicIcon />}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={loading}
                  color={isRecording ? 'error' : 'primary'}
                  aria-label={isRecording ? t('solver.stopRecording') : t('solver.startRecording')}
                  data-testid="record-button"
                >
                  {isRecording ? t('solver.stopRecording') : t('solver.startRecording')}
                </Button>
              </Box>

              {imagePreview && (
                <Card sx={{ mb: 2, maxWidth: 300 }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      image={imagePreview}
                      alt={t('solver.uploadedImage')}
                      sx={{ height: 200, objectFit: 'contain' }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: theme.palette.background.paper,
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                      onClick={handleClearImage}
                      aria-label={t('solver.clearImage')}
                      data-testid="clear-image-button"
                    >
                      <ClearIcon />
                    </IconButton>
                  </Box>
                </Card>
              )}

              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading || !latexInput.trim()}
                sx={{ minWidth: 120 }}
                data-testid="solve-button"
              >
                {loading ? <CircularProgress size={24} /> : t('solver.solve')}
              </Button>
            </form>

            {error && (
              <Alert 
                severity="error" 
                sx={{ mt: 2 }}
                role="alert"
              >
                {error}
              </Alert>
            )}

            {solution && (
              <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{t('solver.solution')}</Typography>
                  {user && (
                    <Tooltip title={t('solver.saveToHistory')}>
                      <IconButton 
                        onClick={handleSaveToHistory}
                        aria-label={t('solver.saveToHistory')}
                      >
                        <SaveIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box 
                  ref={contentRef}
                  sx={{
                    '& .katex': {
                      fontSize: '1.1em',
                      color: theme.palette.text.primary,
                    },
                    '& .katex-display': {
                      margin: '1em 0',
                    },
                  }}
                >
                  <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {solution.steps}
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {showHistory && (
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3,
                backgroundColor: theme.palette.background.paper,
                transition: theme.transitions.create(['background-color']),
              }}
            >
              <Typography variant="h6" gutterBottom>
                {t('solver.recentSolutions')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {solutionHistory.length > 0 ? (
                solutionHistory.map((item, index) => (
                  <Card 
                    key={index} 
                    sx={{ 
                      mb: 2, 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }} 
                    onClick={() => handleHistoryItemClick(item)}
                  >
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {new Date(item.timestamp).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" noWrap>
                        {item.problem}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('solver.noRecentSolutions')}
                </Typography>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

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

export default SolverPage; 