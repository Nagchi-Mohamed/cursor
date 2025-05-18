import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Stack,
  Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import AdminFeedbackService from '../../services/adminFeedbackService';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '../../contexts/LanguageContext';
import FeedbackDetailModal from '../../components/admin/FeedbackDetailModal';
import debounce from 'lodash.debounce';

const AdminFeedbackListPage = () => {
  // State for feedback data and pagination
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage();
  
  // Pagination and sorting state
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10
  });
  const [sortModel, setSortModel] = useState([
    { field: 'createdAt', sort: 'desc' }
  ]);
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });
  
  // Modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  
  // Fetch feedback items with current pagination, sorting, and filters
  const fetchFeedbackItems = useCallback(async () => {
    setLoading(true);
    try {
      // Convert MUI DataGrid state to API parameters
      const params = {
        page: paginationModel.page + 1, // DataGrid is 0-indexed, API is 1-indexed
        limit: paginationModel.pageSize,
        search: filters.search || undefined,
        status: filters.status || undefined
      };
      
      // Add sorting if available
      if (sortModel.length > 0) {
        params.sortBy = sortModel[0].field;
        params.sortOrder = sortModel[0].sort || 'desc';
      }
      
      const response = await AdminFeedbackService.getFeedbackItems(params);
      setFeedbackItems(response.data.feedback);
      setTotalItems(response.totalFeedback);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch feedback items');
      console.error('Error fetching feedback items:', err);
    } finally {
      setLoading(false);
    }
  }, [paginationModel, sortModel, filters]);

  // Initial load and reload when dependencies change
  useEffect(() => {
    fetchFeedbackItems();
  }, [fetchFeedbackItems]);
  
  // Handle pagination change
  const handlePaginationModelChange = (newModel) => {
    setPaginationModel(newModel);
  };
  
  // Handle sort change
  const handleSortModelChange = (newModel) => {
    setSortModel(newModel);
  };
  
  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value) => {
      setFilters(prev => ({ ...prev, search: value }));
      setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page
    }, 500),
    []
  );
  
  // Handle search input change
  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };
  
  // Handle status filter change
  const handleStatusChange = (e) => {
    setFilters(prev => ({ ...prev, status: e.target.value }));
    setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page
  };
  
  // Open detail modal
  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setDetailModalOpen(true);
  };
  
  // Close detail modal
  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedFeedback(null);
  };
  
  // After successful status update
  const handleFeedbackUpdated = () => {
    fetchFeedbackItems();
  };
  
  // Archive feedback item
  const handleArchiveFeedback = async (feedbackId) => {
    try {
      await AdminFeedbackService.archiveFeedbackItem(feedbackId);
      fetchFeedbackItems();
    } catch (err) {
      setError(err.message || 'Failed to archive feedback');
    }
  };

  // Get user info for display
  const getUserInfo = (feedback) => {
    if (feedback.userId) {
      const user = feedback.userId;
      return user.username || user.email || 'Unknown User';
    }
    return feedback.email || 'Anonymous';
  };

  // Truncate message for display in the grid
  const truncateMessage = (message, maxLength = 100) => {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return `${message.substring(0, maxLength)}...`;
  };

  // Get page context for display
  const getPageContext = (feedback) => {
    if (!feedback.context) return 'Not specified';
    return feedback.context.page || 'Not specified';
  };

  // DataGrid columns configuration
  const columns = [
    { 
      field: 'user', 
      headerName: t('admin.feedback.columns.user'), 
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => getUserInfo(params.row)
    },
    { 
      field: 'message', 
      headerName: t('admin.feedback.columns.message'), 
      flex: 2,
      minWidth: 200,
      valueGetter: (params) => truncateMessage(params.row.message)
    },
    { 
      field: 'context', 
      headerName: t('admin.feedback.columns.context'), 
      flex: 1,
      minWidth: 120,
      valueGetter: (params) => getPageContext(params.row)
    },
    { 
      field: 'status', 
      headerName: t('admin.feedback.columns.status'), 
      width: 140,
      renderCell: (params) => {
        const statusColors = {
          'New': 'error',
          'Read': 'info',
          'In Progress': 'warning',
          'Resolved': 'success',
          'Archived': 'default'
        };
        return (
          <Chip 
            size="small" 
            label={params.value} 
            color={statusColors[params.value] || 'default'} 
          />
        );
      }
    },
    { 
      field: 'createdAt', 
      headerName: t('admin.feedback.columns.submitted'), 
      width: 170,
      valueFormatter: (params) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        return `${date.toLocaleDateString()} ${formatDistanceToNow(date, { addSuffix: true })}`;
      }
    },
    { 
      field: 'actions', 
      headerName: t('admin.feedback.columns.actions'), 
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title={t('admin.feedback.actions.view')}>
            <IconButton
              size="small"
              onClick={() => handleViewFeedback(params.row)}
              aria-label={t('admin.feedback.actions.view')}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('admin.feedback.actions.archive')}>
            <IconButton
              size="small"
              onClick={() => handleArchiveFeedback(params.row._id)}
              aria-label={t('admin.feedback.actions.archive')}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('admin.feedback.title')}
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={6}>
            <TextField
              fullWidth
              placeholder={t('admin.feedback.searchPlaceholder')}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('admin.feedback.filterStatus')}</InputLabel>
              <Select
                value={filters.status}
                label={t('admin.feedback.filterStatus')}
                onChange={handleStatusChange}
              >
                <MenuItem value="">{t('admin.feedback.allStatuses')}</MenuItem>
                <MenuItem value="New">{t('admin.feedback.statusNew')}</MenuItem>
                <MenuItem value="Read">{t('admin.feedback.statusRead')}</MenuItem>
                <MenuItem value="In Progress">{t('admin.feedback.statusInProgress')}</MenuItem>
                <MenuItem value="Resolved">{t('admin.feedback.statusResolved')}</MenuItem>
                <MenuItem value="Archived">{t('admin.feedback.statusArchived')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ height: 600 }}>
        <DataGrid
          rows={feedbackItems}
          columns={columns}
          getRowId={(row) => row._id}
          rowCount={totalItems}
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          paginationMode="server"
          onPaginationModelChange={handlePaginationModelChange}
          sortingMode="server"
          onSortModelChange={handleSortModelChange}
          sortModel={sortModel}
          loading={loading}
          disableRowSelectionOnClick
          localeText={{
            noRowsLabel: t('admin.feedback.noFeedback')
          }}
        />
      </Paper>
      
      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <FeedbackDetailModal
          open={detailModalOpen}
          onClose={handleCloseDetailModal}
          feedback={selectedFeedback}
          onFeedbackUpdated={handleFeedbackUpdated}
        />
      )}
    </Box>
  );
};

export default AdminFeedbackListPage; 