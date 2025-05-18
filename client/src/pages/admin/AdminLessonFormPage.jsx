import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import MDEditor from '@uiw/react-md-editor';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useLanguage } from '../../contexts/LanguageContext';
import adminLessonService from '../../services/adminLessonService';
import CustomToolbar from '../../components/editor/CustomToolbar';

const AdminLessonFormPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isEditMode = Boolean(lessonId);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    category: '',
    difficulty: 'beginner',
    estimatedTime: 30,
    tags: [],
    status: 'draft',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchLesson();
    }
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const response = await adminLessonService.getLessonById(lessonId);
      setFormData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditorChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      content: value || '',
    }));
  };

  const handleImageUpload = (imageUrl) => {
    const imageMarkdown = `![Uploaded Image](${imageUrl})`;
    setFormData((prev) => ({
      ...prev,
      content: prev.content + '\n' + imageMarkdown,
    }));
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (status) => {
    try {
      setLoading(true);
      setError(null);

      const lessonData = {
        ...formData,
        status,
      };

      if (isEditMode) {
        await adminLessonService.updateLesson(lessonId, lessonData);
      } else {
        await adminLessonService.createLesson(lessonData);
      }

      navigate('/admin/lessons');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isEditMode ? t('admin.editLesson') : t('admin.createLesson')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('admin.title')}
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('admin.slug')}
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label={t('admin.summary')}
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>{t('admin.category')}</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <MenuItem value="algebra">{t('categories.algebra')}</MenuItem>
                <MenuItem value="geometry">{t('categories.geometry')}</MenuItem>
                <MenuItem value="calculus">{t('categories.calculus')}</MenuItem>
                <MenuItem value="statistics">{t('categories.statistics')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>{t('admin.difficulty')}</InputLabel>
              <Select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                required
              >
                <MenuItem value="beginner">{t('difficulty.beginner')}</MenuItem>
                <MenuItem value="intermediate">{t('difficulty.intermediate')}</MenuItem>
                <MenuItem value="advanced">{t('difficulty.advanced')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label={t('admin.estimatedTime')}
              name="estimatedTime"
              value={formData.estimatedTime}
              onChange={handleChange}
              required
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('admin.tags')}
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyPress={handleTagInputKeyPress}
              helperText={t('admin.tagsHelp')}
            />
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              {t('admin.content')}
            </Typography>
            <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <CustomToolbar onImageUpload={handleImageUpload} />
              <MDEditor
                value={formData.content}
                onChange={handleEditorChange}
                preview="edit"
                height={400}
                previewOptions={{
                  remarkPlugins: [remarkMath],
                  rehypePlugins: [rehypeKatex],
                }}
              />
              <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                {t('admin.mathHelp')}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/admin/lessons')}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSubmit('draft')}
                disabled={loading}
              >
                {t('admin.saveDraft')}
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleSubmit('published')}
                disabled={loading}
              >
                {t('admin.publish')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AdminLessonFormPage; 