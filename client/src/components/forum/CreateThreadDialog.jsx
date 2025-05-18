import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Alert,
  useTheme,
  alpha,
  Typography,
} from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * CreateThreadDialog component for creating new forum threads
 * @param {Object} props Component props
 * @param {boolean} props.open Whether the dialog is open
 * @param {Function} props.onClose Function to call when dialog is closed
 * @param {Function} props.onSubmit Function to call when form is submitted
 * @returns {JSX.Element} The CreateThreadDialog component
 */
const CreateThreadDialog = ({ open, onClose, onSubmit }) => {
  const { t } = useLanguage();
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setTitle('');
      setContent('');
      setCategory('');
      setTags([]);
      setTagInput('');
      setError('');
      setIsSubmitting(false);
    }
  }, [open]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      // Validate form
      if (!title.trim()) {
        throw new Error(t('forum.errors.titleRequired'));
      }
      if (!content.trim()) {
        throw new Error(t('forum.errors.contentRequired'));
      }
      if (!category) {
        throw new Error(t('forum.errors.categoryRequired'));
      }

      // Submit form
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tags.map(tag => tag.trim())
      });

      // Reset form
      setTitle('');
      setContent('');
      setCategory('');
      setTags([]);
      setTagInput('');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle tag input
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  // Handle tag input key press
  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (tags.length < 5 && !tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
        setTagInput('');
      }
    }
  };

  // Handle tag deletion
  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
        sx: {
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(8px)'
        }
      }}
      aria-labelledby="create-thread-title"
      aria-describedby="create-thread-description"
    >
      <DialogTitle id="create-thread-title">
        {t('forum.createThread')}
      </DialogTitle>
      
      <DialogContent>
        <Typography
          id="create-thread-description"
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {t('forum.createThreadDescription')}
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            role="alert"
            aria-live="assertive"
          >
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label={t('forum.threadTitle')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            autoFocus
            error={error && !title.trim()}
            helperText={error && !title.trim() ? t('forum.errors.titleRequired') : ''}
            inputProps={{
              'aria-required': 'true',
              'aria-invalid': error && !title.trim() ? 'true' : 'false'
            }}
          />

          <FormControl fullWidth required error={error && !category}>
            <InputLabel id="category-label">{t('forum.category')}</InputLabel>
            <Select
              labelId="category-label"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label={t('forum.category')}
              aria-required="true"
              aria-invalid={error && !category ? 'true' : 'false'}
            >
              <MenuItem value="general">{t('forum.categories.general')}</MenuItem>
              <MenuItem value="help">{t('forum.categories.help')}</MenuItem>
              <MenuItem value="discussion">{t('forum.categories.discussion')}</MenuItem>
              <MenuItem value="announcement">{t('forum.categories.announcement')}</MenuItem>
            </Select>
            {error && !category && (
              <Typography variant="caption" color="error">
                {t('forum.errors.categoryRequired')}
              </Typography>
            )}
          </FormControl>

          <TextField
            label={t('forum.tags')}
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyPress={handleTagInputKeyPress}
            fullWidth
            helperText={t('forum.tagsHelp')}
            InputProps={{
              endAdornment: (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    flexWrap: 'wrap', 
                    mt: 1,
                    '& .MuiChip-root': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                  role="list"
                  aria-label={t('forum.selectedTags')}
                >
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleDeleteTag(tag)}
                      size="small"
                      role="listitem"
                      aria-label={`${t('forum.tag')}: ${tag}`}
                    />
                  ))}
                </Box>
              )
            }}
          />

          <TextField
            label={t('forum.content')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            required
            multiline
            rows={6}
            error={error && !content.trim()}
            helperText={
              error && !content.trim() 
                ? t('forum.errors.contentRequired')
                : t('forum.contentHelp')
            }
            inputProps={{
              'aria-required': 'true',
              'aria-invalid': error && !content.trim() ? 'true' : 'false'
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={onClose}
          disabled={isSubmitting}
        >
          {t('common.cancel')}
        </Button>
        <Button 
          type="submit" 
          variant="contained"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? t('common.submitting') : t('forum.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateThreadDialog; 