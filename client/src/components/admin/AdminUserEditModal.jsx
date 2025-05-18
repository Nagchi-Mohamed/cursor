import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  FormControlLabel,
  Switch,
  Grid,
  Divider,
  CircularProgress
} from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import AdminUserService from '../../services/adminUserService';
import FormField from '../common/FormField';

/**
 * Modal component for editing user roles and status in the admin panel
 * @param {Object} props Component props
 * @param {boolean} props.open Whether the modal is open
 * @param {Function} props.onClose Function to close the modal
 * @param {Object} props.user User data to edit
 * @param {Function} props.onUserUpdate Callback function after successful update
 */
const AdminUserEditModal = ({ open, onClose, user, onUserUpdate }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    role: '',
    isBanned: false,
    isActive: true
  });
  
  // Initialize form with user data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        role: user.role || 'user',
        isBanned: user.isBanned || false,
        isActive: user.isActive !== undefined ? user.isActive : true
      });
      setError(null);
      setSuccess(false);
    }
  }, [user]);
  
  // Handle form field changes
  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear messages when form is edited
    setError(null);
    setSuccess(false);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?._id) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Only send changed fields to the API
      const updatedData = {};
      if (formData.role !== user.role) updatedData.role = formData.role;
      if (formData.isBanned !== user.isBanned) updatedData.isBanned = formData.isBanned;
      if (formData.isActive !== user.isActive) updatedData.isActive = formData.isActive;
      
      // Only make API call if there are changes
      if (Object.keys(updatedData).length > 0) {
        await AdminUserService.updateUserByAdmin(user._id, updatedData);
        setSuccess(true);
        // Call parent callback after successful update
        if (onUserUpdate) onUserUpdate();
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || t('admin.users.updateError'));
      console.error('Error updating user:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle close
  const handleClose = () => {
    if (!loading) {
      setError(null);
      setSuccess(false);
      onClose();
    }
  };
  
  if (!user) return null;
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      aria-labelledby="edit-user-title"
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle id="edit-user-title">
          {t('admin.users.editTitle')}
        </DialogTitle>
        
        <DialogContent dividers>
          {/* User Info (Read-Only) */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('admin.users.userInfo')}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormField
                  label={t('admin.users.username')}
                  value={user.username || ''}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormField
                  label={t('admin.users.email')}
                  value={user.email || ''}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <FormField
                  label={t('admin.users.name')}
                  value={`${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || '-'}
                  disabled
                />
              </Grid>
            </Grid>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Editable Fields */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('admin.users.roleAndStatus')}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="role-label">{t('admin.users.role')}</InputLabel>
                  <Select
                    labelId="role-label"
                    value={formData.role}
                    label={t('admin.users.role')}
                    onChange={handleChange('role')}
                  >
                    <MenuItem value="user">{t('admin.users.roleUser')}</MenuItem>
                    <MenuItem value="editor">{t('admin.users.roleEditor')}</MenuItem>
                    <MenuItem value="admin">{t('admin.users.roleAdmin')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isBanned}
                      onChange={handleChange('isBanned')}
                      color="error"
                    />
                  }
                  label={t('admin.users.isBanned')}
                />
                {formData.isBanned && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                    {t('admin.users.bannedWarning')}
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleChange('isActive')}
                    />
                  }
                  label={t('admin.users.isActive')}
                />
                {!formData.isActive && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {t('admin.users.inactiveWarning')}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
          
          {/* Messages */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {t('admin.users.updateSuccess')}
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            {success ? t('common.close') : t('common.cancel')}
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {t('common.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AdminUserEditModal; 