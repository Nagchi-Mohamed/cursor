import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Pagination,
  CircularProgress,
  Alert,
  Avatar,
  useTheme,
  useMediaQuery,
  alpha,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ThumbUp as LikeIcon,
  CheckCircle as SolutionIcon,
  Reply as ReplyIcon,
} from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { forumService } from '../services/forumService';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

/**
 * ThreadPage component for viewing individual forum threads
 * @returns {JSX.Element} The ThreadPage component
 */
const ThreadPage = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useLanguage();
  const { user } = useAuth();

  // State management
  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch thread and posts
  const fetchThreadAndPosts = async () => {
    try {
      setLoading(true);
      const [threadResponse, postsResponse] = await Promise.all([
        forumService.getThreadById(threadId),
        forumService.getThreadPosts(threadId, { page, limit: 10 })
      ]);

      setThread(threadResponse.data.thread);
      setPosts(postsResponse.data.posts);
      setTotalPages(postsResponse.data.pagination.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when page changes
  useEffect(() => {
    fetchThreadAndPosts();
  }, [threadId, page]);

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Handle reply submission
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await forumService.createPost(threadId, {
        content: replyContent.trim(),
        parentPost: replyingTo?._id
      });

      setPosts([...posts, response.data.post]);
      setReplyContent('');
      setReplyingTo(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle post like
  const handleLikePost = async (postId) => {
    try {
      await forumService.likePost(postId);
      fetchThreadAndPosts(); // Refresh to get updated like count
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle marking post as solution
  const handleMarkAsSolution = async (postId) => {
    try {
      await forumService.markPostAsSolution(postId);
      fetchThreadAndPosts(); // Refresh to get updated solution status
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle post deletion
  const handleDeletePost = async (postId) => {
    if (!window.confirm(t('forum.confirmDelete'))) return;

    try {
      await forumService.deletePost(postId);
      if (postId === thread.firstPost) {
        navigate('/forum'); // Navigate back to forum if first post is deleted
      } else {
        fetchThreadAndPosts(); // Refresh posts
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading && !thread) {
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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert 
          severity="error"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/forum')}
        sx={{ mb: 2 }}
        aria-label={t('common.back')}
      >
        {t('common.back')}
      </Button>

      {/* Thread header */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(8px)'
        }}
        elevation={1}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          {thread.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={t(`forum.categories.${thread.category}`)}
            color="primary"
            variant="outlined"
            aria-label={t('forum.category')}
          />
          {thread.tags?.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              variant="outlined"
              aria-label={t('forum.tag')}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            {t('forum.by')} {thread.authorName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {thread.viewCount} {t('forum.views')}
          </Typography>
        </Box>
      </Paper>

      {/* Posts */}
      <Box 
        sx={{ mb: 3 }}
        role="list"
        aria-label={t('forum.postList')}
      >
        {posts.map((post) => (
          <Card
            key={post._id}
            sx={{
              mb: 2,
              borderLeft: post.isSolution ? `4px solid ${theme.palette.success.main}` : 'none',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4],
                bgcolor: alpha(theme.palette.primary.main, 0.02)
              }
            }}
            role="listitem"
            aria-labelledby={`post-author-${post._id}`}
          >
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={1}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: theme.palette.primary.main
                    }}
                    aria-hidden="true"
                  >
                    {post.authorName[0]}
                  </Avatar>
                </Grid>

                <Grid item xs={12} sm={11}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Typography 
                      id={`post-author-${post._id}`}
                      variant="subtitle1" 
                      component="span"
                    >
                      {post.authorName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </Typography>
                    {post.isEdited && (
                      <Typography variant="body2" color="text.secondary">
                        ({t('forum.edited')})
                      </Typography>
                    )}
                    {post.isSolution && (
                      <Chip
                        icon={<SolutionIcon />}
                        label={t('forum.solution')}
                        color="success"
                        size="small"
                        aria-label={t('forum.solution')}
                      />
                    )}
                  </Box>

                  <Box 
                    sx={{ 
                      mb: 2,
                      '& .markdown-body': {
                        color: 'text.primary',
                        '& pre': {
                          bgcolor: alpha(theme.palette.background.paper, 0.5),
                          borderRadius: 1,
                          p: 2
                        },
                        '& code': {
                          bgcolor: alpha(theme.palette.background.paper, 0.5),
                          borderRadius: 0.5,
                          px: 0.5
                        }
                      }
                    }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      className="markdown-body"
                    >
                      {post.content}
                    </ReactMarkdown>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Tooltip title={t('forum.like')}>
                      <IconButton
                        size="small"
                        onClick={() => handleLikePost(post._id)}
                        color={post.likes?.includes(user?._id) ? 'primary' : 'default'}
                        aria-label={t('forum.like')}
                      >
                        <LikeIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Typography variant="body2" color="text.secondary">
                      {post.likeCount || 0}
                    </Typography>

                    <Tooltip title={t('forum.reply')}>
                      <IconButton
                        size="small"
                        onClick={() => setReplyingTo(post)}
                        aria-label={t('forum.reply')}
                      >
                        <ReplyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {user && (user._id === post.createdBy || user.isAdmin) && (
                      <>
                        <Tooltip title={t('forum.edit')}>
                          <IconButton 
                            size="small"
                            aria-label={t('forum.edit')}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title={t('forum.delete')}>
                          <IconButton
                            size="small"
                            onClick={() => handleDeletePost(post._id)}
                            aria-label={t('forum.delete')}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}

                    {user && (user._id === thread.createdBy || user.isAdmin) && !post.isSolution && (
                      <Tooltip title={t('forum.markAsSolution')}>
                        <IconButton
                          size="small"
                          onClick={() => handleMarkAsSolution(post._id)}
                          aria-label={t('forum.markAsSolution')}
                        >
                          <SolutionIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
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

      {/* Reply form */}
      {user && (
        <Paper 
          sx={{ 
            p: 3,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(8px)'
          }}
          elevation={1}
        >
          {replyingTo && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('forum.replyingTo')} {replyingTo.authorName}
              </Typography>
              <Button
                size="small"
                onClick={() => setReplyingTo(null)}
                aria-label={t('common.cancel')}
              >
                {t('common.cancel')}
              </Button>
            </Box>
          )}

          <form onSubmit={handleReplySubmit}>
            <TextField
              label={t('forum.reply')}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              fullWidth
              multiline
              rows={4}
              required
              sx={{ mb: 2 }}
              disabled={isSubmitting}
              inputProps={{
                'aria-label': t('forum.reply'),
                'aria-required': 'true'
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!replyContent.trim() || isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? t('common.submitting') : t('forum.postReply')}
            </Button>
          </form>
        </Paper>
      )}
    </Container>
  );
};

export default ThreadPage; 