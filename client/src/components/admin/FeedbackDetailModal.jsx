import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import AdminFeedbackService from '../../services/adminFeedbackService';
import { formatDistance } from 'date-fns';

/**
 * Modal component for displaying and updating feedback details
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Object} props.feedback - Feedback data to display
 * @param {Function} props.onFeedbackUpdated - Callback function after successful update
 */
const FeedbackDetailModal = ({ open, onClose, feedback, onFeedbackUpdated }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState('');
  
  // Initialize status state when feedback changes
  useEffect(() => {
    if (feedback) {
      setStatus(feedback.status || 'New');
      setError(null);
      setSuccess(false);
    }
  }, [feedback]);
  
  // Handle status change
  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setError(null);
    setSuccess(false);
  };
  
  // Handle save status
  const handleSaveStatus = async () => {
    if (!feedback || !feedback._id || status === feedback.status) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await AdminFeedbackService.updateFeedbackStatus(feedback._id, status);
      setSuccess(true);
      
      // Call parent callback after successful update
      if (onFeedbackUpdated) {
        onFeedbackUpdated();
      }
    } catch (err) {
      setError(err.message || t('admin.feedback.updateError'));
      console.error('Error updating feedback status:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Get user info for display
  const getUserInfo = () => {
    if (!feedback) return '';
    
    if (feedback.userId) {
      const user = feedback.userId;
      return user.username || user.email || 'Unknown User';
    }
    
    return feedback.email || 'Anonymous';
  };
  
  // Get page context for display
  const getContextInfo = () => {
    if (!feedback || !feedback.context) return 'Not specified';
    
    let contextInfo = [];
    
    if (feedback.context.page) {
      contextInfo.push(`Page: ${feedback.context.page}`);
    }
    
    if (feedback.context.lessonId) {
      contextInfo.push(`Lesson ID: ${feedback.context.lessonId}`);
    }
    
    if (feedback.context.practiceSetId) {
      contextInfo.push(`Practice Set ID: ${feedback.context.practiceSetId}`);
    }
    
    return contextInfo.length > 0 ? contextInfo.join(', ') : 'Not specified';
  };
  
  // Get formatted date
  const getFormattedDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()} (${formatDistance(date, new Date(), { addSuffix: true })})`;
  };
  
  if (!feedback) return null;
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="feedback-detail-title"
    >
      <DialogTitle id="feedback-detail-title">
        {t('admin.feedback.detailTitle')}
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Metadata Section */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary' }}>
                {t('admin.feedback.metadata')}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" display="block" color="text.secondary">
                  {t('admin.feedback.fromUser')}
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {getUserInfo()}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" display="block" color="text.secondary">
                  {t('admin.feedback.submittedOn')}
                </Typography>
                <Typography variant="body2">
                  {getFormattedDate(feedback.createdAt)}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" display="block" color="text.secondary">
                  {t('admin.feedback.context')}
                </Typography>
                <Typography variant="body2">
                  {getContextInfo()}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" display="block" color="text.secondary">
                  {t('admin.feedback.currentStatus')}
                </Typography>
                <Chip 
                  size="small" 
                  label={feedback.status} 
                  color={
                    feedback.status === 'New' ? 'error' :
                    feedback.status === 'Read' ? 'info' :
                    feedback.status === 'In Progress' ? 'warning' :
                    feedback.status === 'Resolved' ? 'success' :
                    'default'
                  }
                  sx={{ mt: 0.5 }}
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="status-select-label">
                  {t('admin.feedback.updateStatus')}
                </InputLabel>
                <Select
                  labelId="status-select-label"
                  value={status}
                  label={t('admin.feedback.updateStatus')}
                  onChange={handleStatusChange}
                  disabled={loading}
                >
                  <MenuItem value="New">{t('admin.feedback.statusNew')}</MenuItem>
                  <MenuItem value="Read">{t('admin.feedback.statusRead')}</MenuItem>
                  <MenuItem value="In Progress">{t('admin.feedback.statusInProgress')}</MenuItem>
                  <MenuItem value="Resolved">{t('admin.feedback.statusResolved')}</MenuItem>
                  <MenuItem value="Archived">{t('admin.feedback.statusArchived')}</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSaveStatus}
                disabled={loading || status === feedback.status}
                sx={{ mt: 2 }}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {t('admin.feedback.saveStatus')}
              </Button>
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {t('admin.feedback.statusUpdated')}
                </Alert>
              )}
            </Paper>
          </Grid>
          
          {/* Message Content Section */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary' }}>
                {t('admin.feedback.messageContent')}
              </Typography>
              
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: 'background.default', 
                  borderRadius: 1,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  overflowY: 'auto',
                  minHeight: '200px',
                  maxHeight: '400px'
                }}
              >
                <Typography variant="body2">
                  {feedback.message || t('admin.feedback.noMessage')}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackDetailModal; 