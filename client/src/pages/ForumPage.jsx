import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Pagination,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Comment as CommentIcon,
  ThumbUp as LikeIcon,
} from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { forumService } from '../services/forumService';
import CreateThreadDialog from '../components/forum/CreateThreadDialog';
import { formatDistanceToNow } from 'date-fns';

/**
 * ForumPage component for displaying forum threads
 * @returns {JSX.Element} The ForumPage component
 */
const ForumPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useLanguage();
  const { user } = useAuth();

  // State management
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('lastReplyAt');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Fetch threads
  const fetchThreads = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: searchQuery || undefined,
        category: category || undefined,
        sort: sortBy
      };

      const response = await forumService.getThreads(params);
      setThreads(response.data.threads);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when filters change
  useEffect(() => {
    fetchThreads();
  }, [page, searchQuery, category, sortBy]);

  // Handle search
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset to first page on new search
  };

  // Handle category change
  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setPage(1);
  };

  // Handle sort change
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPage(1);
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Handle thread creation
  const handleCreateThread = async (threadData) => {
    try {
      const response = await forumService.createThread(threadData);
      setCreateDialogOpen(false);
      navigate(`/forum/thread/${response.data.thread._id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  // Render thread card
  const renderThreadCard = (thread) => (
    <Card
      key={thread._id}
      sx={{
        mb: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
          bgcolor: alpha(theme.palette.primary.main, 0.02)
        },
        '&:focus-within': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2
        }
      }}
      tabIndex={0}
      role="article"
      aria-labelledby={`thread-title-${thread._id}`}
    >
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography
              id={`thread-title-${thread._id}`}
              variant="h6"
              component="h2"
              sx={{
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' },
                '&:focus': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: 2
                }
              }}
              onClick={() => navigate(`/forum/thread/${thread._id}`)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate(`/forum/thread/${thread._id}`);
                }
              }}
            >
              {thread.title}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {t('forum.by')} {thread.authorName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={t(`forum.categories.${thread.category}`)}
                size="small"
                color="primary"
                variant="outlined"
                aria-label={t('forum.category')}
              />
              {thread.tags?.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  aria-label={t('forum.tag')}
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Tooltip title={t('forum.views')}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ViewIcon fontSize="small" color="action" aria-hidden="true" />
                  <Typography variant="body2" color="text.secondary">
                    {thread.viewCount}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title={t('forum.replies')}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CommentIcon fontSize="small" color="action" aria-hidden="true" />
                  <Typography variant="body2" color="text.secondary">
                    {thread.postCount - 1}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title={t('forum.likes')}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LikeIcon fontSize="small" color="action" aria-hidden="true" />
                  <Typography variant="body2" color="text.secondary">
                    {thread.likeCount || 0}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  if (loading && !threads.length) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        role="status"
        aria-label={t('common.loading')}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('forum.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {t('forum.description')}
        </Typography>
      </Box>

      {/* Controls */}
      <Paper 
        sx={{ 
          p: 2, 
          mb: 3,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(8px)'
        }}
        elevation={1}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder={t('forum.searchPlaceholder')}
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} aria-hidden="true" />
              }}
              aria-label={t('forum.search')}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="category-label">{t('forum.category')}</InputLabel>
              <Select
                labelId="category-label"
                value={category}
                onChange={handleCategoryChange}
                label={t('forum.category')}
                aria-label={t('forum.category')}
              >
                <MenuItem value="">{t('forum.allCategories')}</MenuItem>
                <MenuItem value="general">{t('forum.categories.general')}</MenuItem>
                <MenuItem value="help">{t('forum.categories.help')}</MenuItem>
                <MenuItem value="discussion">{t('forum.categories.discussion')}</MenuItem>
                <MenuItem value="announcement">{t('forum.categories.announcement')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="sort-label">{t('forum.sortBy')}</InputLabel>
              <Select
                labelId="sort-label"
                value={sortBy}
                onChange={handleSortChange}
                label={t('forum.sortBy')}
                aria-label={t('forum.sortBy')}
              >
                <MenuItem value="lastReplyAt">{t('forum.sort.lastReply')}</MenuItem>
                <MenuItem value="createdAt">{t('forum.sort.created')}</MenuItem>
                <MenuItem value="viewCount">{t('forum.sort.views')}</MenuItem>
                <MenuItem value="postCount">{t('forum.sort.replies')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              disabled={!user}
              aria-label={t('forum.newThread')}
            >
              {t('forum.newThread')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          role="alert"
          aria-live="assertive"
        >
          {error}
        </Alert>
      )}

      {/* Thread List */}
      <Box 
        sx={{ mb: 3 }}
        role="list"
        aria-label={t('forum.threadList')}
      >
        {threads.map(renderThreadCard)}
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            aria-label={t('forum.pagination')}
          />
        </Box>
      )}

      {/* Create Thread Dialog */}
      <CreateThreadDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateThread}
      />
    </Container>
  );
};

export default ForumPage; 