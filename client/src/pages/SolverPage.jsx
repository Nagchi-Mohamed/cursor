import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Divider,
  Card,
  CardMedia,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import HistoryIcon from '@mui/icons-material/History';
import ClearIcon from '@mui/icons-material/Clear';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import * as solverService from '../services/SolverService';
import * as historyService from '../services/HistoryService';

// Styled components (optional, for better layout if needed)
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(2),
}));

const SolutionBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.default,
  minHeight: '100px',
  whiteSpace: 'pre-wrap', // To respect newlines and spaces in solution
}));

const SolverPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();

  const [problemInput, setProblemInput] = useState('');
  const [solution, setSolution] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  const [uploadedImage, setUploadedImage] = useState(null); // { file: File, preview: string }
  const [imageProcessingError, setImageProcessingError] = useState(null);
  const fileInputRef = useRef(null);

  const [recordingState, setRecordingState] = useState('inactive'); // inactive, recording, processing
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await historyService.getHistory('solver'); // Assuming 'solver' is the type
      if (data && Array.isArray(data.history)) {
        setHistory(data.history);
      } else {
        setHistoryError(t('errors.loadHistoryFailed'));
      }
    } catch (err) {
      setHistoryError(t('errors.loadHistoryFailed'));
    } finally {
      setIsHistoryLoading(false);
    }
  }, [isAuthenticated, t]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleInputChange = (event) => {
    setProblemInput(event.target.value);
    if (solution || error) {
      setSolution(null);
      setError(null);
    }
  };

  const commonSolve = async (input, inputType = 'text', imageFile = null) => {
    setIsLoading(true);
    setSolution(null);
    setError(null);
    try {
      const problemToSolve = inputType === 'text' && !input ? problemInput : input;
      const response = await solverService.solveProblem({ input: problemToSolve, inputType }, imageFile);
      if (response && response.solution) {
        setSolution(response.solution);
        if (isAuthenticated && user) {
          loadHistory();
        }
      } else {
        setError(t('errors.solvingFailed'));
      }
    } catch (err) {
      setError(t('errors.solvingFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!problemInput.trim() && !uploadedImage) {
      setError(t('solver.pleaseEnterProblem'));
      return;
    }
    await commonSolve(problemInput, uploadedImage ? 'latex' : 'text', uploadedImage ? uploadedImage.file : undefined);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setUploadedImage({ file, preview: URL.createObjectURL(file) });
      setError(null);
      setSolution(null);
      setImageProcessingError(null);
      setIsLoading(true);
      try {
        const response = await solverService.processImage(file);
        if (response && (response.latex || response.text)) {
          const extractedText = response.latex || response.text;
          setProblemInput(extractedText);
        } else {
          throw new Error('Invalid response from image processing');
        }
      } catch (err) {
        setImageProcessingError(t('errors.imageProcessingFailed'));
        setUploadedImage(null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    setProblemInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
    setSolution(null);
  };

  const handleToggleRecording = async () => {
    if (recordingState === 'inactive') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstart = () => {
          setRecordingState('recording');
        };

        mediaRecorderRef.current.onstop = async () => {
          setRecordingState('processing');
          const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current.mimeType || 'audio/webm' });
          audioChunksRef.current = [];
          stream.getTracks().forEach(track => track.stop());

          try {
            const response = await solverService.processVoiceInput(audioBlob);
            if (response && response.text) {
              setProblemInput(response.text);
            } else {
              throw new Error('Invalid response from voice processing');
            }
          } catch (err) {
            setError(t('errors.voiceProcessingFailed'));
          } finally {
            setRecordingState('inactive');
          }
        };
        mediaRecorderRef.current.start();
      } catch (err) {
        setError(t('errors.micAccessDenied'));
        setRecordingState('inactive');
      }
    } else if (recordingState === 'recording') {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={8}>
          <StyledPaper elevation={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" gutterBottom component="h1">
                {t('nav.solver')}
              </Typography>
              {isAuthenticated && (
                <Tooltip title={t('actions.toggleHistory')}>
                  <IconButton onClick={() => setIsHistoryVisible(!isHistoryVisible)} color="default">
                    <HistoryIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {!isAuthenticated && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {t('solver.loginRequired')}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                label={t('solver.inputLabel')}
                placeholder={t('solver.inputPlaceholder')}
                value={problemInput}
                onChange={handleInputChange}
                margin="normal"
                id="problem-input"
              />

              {isAuthenticated && (
                <Box sx={{ display: 'flex', gap: 2, my: 2, alignItems: 'center' }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload-input"
                    type="file"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    data-testid="image-upload-input-hidden"
                  />
                  <label htmlFor="image-upload-input">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCameraIcon />}
                      data-testid="upload-image-button"
                    >
                      {t('solver.uploadImage')}
                    </Button>
                  </label>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={recordingState === 'recording' ? <MicOffIcon /> : <MicIcon />}
                    onClick={handleToggleRecording}
                    data-testid="record-button"
                    disabled={recordingState === 'processing'}
                  >
                    {recordingState === 'recording'
                      ? t('solver.stopRecording')
                      : recordingState === 'processing'
                      ? t('solver.processing')
                      : t('solver.startRecording')}
                  </Button>
                </Box>
              )}

              {uploadedImage && isAuthenticated && (
                <Card sx={{ mb: 2, maxWidth: 300, position: 'relative' }}>
                  <CardMedia
                    component="img"
                    image={uploadedImage.preview}
                    alt={t('solver.uploadedImage')}
                    sx={{ maxHeight: 200, objectFit: 'contain' }}
                  />
                  <IconButton
                    aria-label={t('solver.clearImage')}
                    onClick={handleClearImage}
                    size="small"
                    data-testid="clear-image-button"
                    sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.7)' }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Card>
              )}
              {imageProcessingError && <Alert severity="error" sx={{ mb: 2 }}>{imageProcessingError}</Alert>}

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading || (!problemInput.trim() && !uploadedImage)}
                data-testid="solve-button"
                fullWidth
                sx={{ mt: 1, py: 1.5 }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : t('solver.solve')}
              </Button>
            </form>

            {error && !isLoading && (
              <Alert severity="error" sx={{ mt: 3 }} data-testid="error-alert">
                {error}
              </Alert>
            )}

            {solution && !isLoading && !error && (
              <SolutionBox data-testid="solution-display">
                <Typography variant="h6" gutterBottom>{t('solver.solution')}</Typography>
                <Divider sx={{ mb: 1 }} />
                {typeof solution === 'object' && solution.solution ? (
                  <>
                    <Typography variant="body1" component="pre" sx={{ fontWeight: 'bold' }}>
                      Result: {solution.solution}
                    </Typography>
                    {solution.steps && solution.steps.length > 0 && (
                      <>
                        <Typography variant="subtitle1" sx={{ mt: 1 }}>
                          Steps:
                        </Typography>
                            {solution.steps.map((step, index) => (
                              <Typography variant="body2" component="pre" key={index}>
                                {step.explanation}
                              </Typography>
                            ))}
                      </>
                    )}
                  </>
                ) : (
                  <Typography variant="body1" component="pre">
                    {solution.toString()}
                  </Typography>
                )}
              </SolutionBox>
            )}
          </StyledPaper>
        </Grid>

        {isAuthenticated && isHistoryVisible && (
          <Grid item xs={12} md={4}>
            <StyledPaper elevation={3}>
              <Typography variant="h5" gutterBottom>{t('solver.historyTitle')}</Typography>
              {isHistoryLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress />
                </Box>
              )}
              {!isHistoryLoading && !historyError && history.length === 0 && (
                <Typography>{t('solver.noHistory')}</Typography>
              )}
              {!isHistoryLoading && !historyError && history.length > 0 && (
                <Box>
                  {history.slice(0, 10).map((item) => (
                    <Paper
                      key={item._id}
                      sx={{ p: 1, mb: 1, cursor: 'pointer' }}
                      onClick={() => setProblemInput(item.problem)}
                    >
                      <Typography variant="caption" display="block" gutterBottom>
                        {new Date(item.createdAt).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        <strong>Problem:</strong> {item.problem}
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        <strong>Solution:</strong> {item.solution?.solution || item.solution}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </StyledPaper>
          </Grid>
        )}
      </Grid>

      {historyError && (
        <Snackbar
          open={!!historyError}
          autoHideDuration={6000}
          onClose={() => setHistoryError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          data-testid="history-error-snackbar"
        >
          <Alert
            onClose={() => setHistoryError(null)}
            severity="error"
            sx={{ width: '100%' }}
            data-testid="history-error-alert-content"
          >
            {historyError}
          </Alert>
        </Snackbar>
      )}
    </Container>
  );
};

export default SolverPage;
