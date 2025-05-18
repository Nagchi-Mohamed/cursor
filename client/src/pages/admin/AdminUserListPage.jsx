import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  Chip,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
  Stack,
  Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import AdminUserService from '../../services/adminUserService';
import { formatDistanceToNow } from 'date-fns';
import AdminUserEditModal from '../../components/admin/AdminUserEditModal';
import { useLanguage } from '../../contexts/LanguageContext';
import debounce from 'lodash.debounce';

const AdminUserListPage = () => {
  // State for user data and pagination
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
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
    keyword: '',
    role: '',
    isBanned: '',
    isActive: ''
  });
  
  // Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // Filter controls visibility
  const [showFilters, setShowFilters] = useState(false);

  // Fetch users with current pagination, sorting, and filters
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Convert MUI DataGrid state to API parameters
      const params = {
        page: paginationModel.page + 1, // DataGrid is 0-indexed, API is 1-indexed
        limit: paginationModel.pageSize,
        keyword: filters.keyword || undefined,
        role: filters.role || undefined,
        isBanned: filters.isBanned === '' ? undefined : filters.isBanned === 'true',
        isActive: filters.isActive === '' ? undefined : filters.isActive === 'true'
      };
      
      // Add sorting if available
      if (sortModel.length > 0) {
        params.sortBy = sortModel[0].field;
        params.sortOrder = sortModel[0].sort || 'desc';
      }
      
      const response = await AdminUserService.getUsers(params);
      setUsers(response.data.users);
      setTotalUsers(response.totalUsers);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [paginationModel, sortModel, filters]);

  // Initial load and reload when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
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
      setFilters(prev => ({ ...prev, keyword: value }));
      setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page
    }, 500),
    []
  );
  
  // Handle search input change
  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };
  
  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page
  };
  
  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      keyword: '',
      role: '',
      isBanned: '',
      isActive: ''
    });
    document.getElementById('search-input').value = '';
  };
  
  // Open edit modal
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };
  
  // Close edit modal
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };
  
  // After successful user update
  const handleUserUpdated = () => {
    fetchUsers();
    setEditModalOpen(false);
    setSelectedUser(null);
  };
  
  // Open delete confirmation
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };
  
  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };
  
  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    setLoading(true);
    try {
      await AdminUserService.deleteUserByAdmin(userToDelete._id);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      setLoading(false);
    }
  };

  // DataGrid columns configuration
  const columns = [
    { 
      field: 'username', 
      headerName: t('admin.users.columns.username'), 
      flex: 1,
      minWidth: 120
    },
    { 
      field: 'email', 
      headerName: t('admin.users.columns.email'), 
      flex: 1.5,
      minWidth: 180 
    },
    { 
      field: 'name', 
      headerName: t('admin.users.columns.name'), 
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => {
        const firstName = params.row.profile?.firstName || '';
        const lastName = params.row.profile?.lastName || '';
        return firstName || lastName ? `${firstName} ${lastName}`.trim() : '-';
      }
    },
    { 
      field: 'role', 
      headerName: t('admin.users.columns.role'), 
      width: 120,
      renderCell: (params) => {
        const roleColors = {
          admin: 'error',
          editor: 'warning',
          user: 'primary'
        };
        return (
          <Chip 
            size="small" 
            label={params.value} 
            color={roleColors[params.value] || 'default'} 
            variant="outlined"
          />
        );
      }
    },
    { 
      field: 'status', 
      headerName: t('admin.users.columns.status'), 
      width: 120,
      valueGetter: (params) => ({
        isBanned: params.row.isBanned,
        isActive: params.row.isActive
      }),
      renderCell: (params) => {
        const value = params.value;
        let label = 'Active';
        let color = 'success';
        
        if (value.isBanned) {
          label = 'Banned';
          color = 'error';
        } else if (!value.isActive) {
          label = 'Inactive';
          color = 'default';
        }
        
        return <Chip size="small" label={label} color={color} />;
      }
    },
    { 
      field: 'createdAt', 
      headerName: t('admin.users.columns.joined'), 
      width: 150,
      valueFormatter: (params) => {
        return params.value ? new Date(params.value).toLocaleDateString() : '-';
      }
    },
    { 
      field: 'lastLogin', 
      headerName: t('admin.users.columns.lastLogin'), 
      width: 150,
      valueFormatter: (params) => {
        return params.value 
          ? formatDistanceToNow(new Date(params.value), { addSuffix: true }) 
          : 'Never';
      }
    },
    { 
      field: 'actions', 
      headerName: t('admin.users.columns.actions'), 
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title={t('admin.users.actions.edit')}>
            <IconButton
              size="small"
              onClick={() => handleEditUser(params.row)}
              aria-label={t('admin.users.actions.edit')}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('admin.users.actions.delete')}>
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(params.row)}
              aria-label={t('admin.users.actions.delete')}
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
        {t('admin.users.title')}
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              id="search-input"
              label={t('admin.users.search')}
              onChange={handleSearchChange}
              fullWidth
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item>
            <Button
              startIcon={<FilterIcon />}
              onClick={toggleFilters}
              variant={showFilters ? "contained" : "outlined"}
              size="small"
            >
              {t('admin.users.filters')}
            </Button>
          </Grid>
          {showFilters && (
            <Grid item>
              <Button
                size="small"
                onClick={resetFilters}
              >
                {t('admin.users.resetFilters')}
              </Button>
            </Grid>
          )}
        </Grid>
        
        {showFilters && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('admin.users.filterRole')}</InputLabel>
                <Select
                  value={filters.role}
                  label={t('admin.users.filterRole')}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                >
                  <MenuItem value="">{t('admin.users.allRoles')}</MenuItem>
                  <MenuItem value="user">{t('admin.users.roleUser')}</MenuItem>
                  <MenuItem value="editor">{t('admin.users.roleEditor')}</MenuItem>
                  <MenuItem value="admin">{t('admin.users.roleAdmin')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('admin.users.filterBanned')}</InputLabel>
                <Select
                  value={filters.isBanned}
                  label={t('admin.users.filterBanned')}
                  onChange={(e) => handleFilterChange('isBanned', e.target.value)}
                >
                  <MenuItem value="">{t('admin.users.allUsers')}</MenuItem>
                  <MenuItem value="true">{t('admin.users.bannedOnly')}</MenuItem>
                  <MenuItem value="false">{t('admin.users.notBannedOnly')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('admin.users.filterActive')}</InputLabel>
                <Select
                  value={filters.isActive}
                  label={t('admin.users.filterActive')}
                  onChange={(e) => handleFilterChange('isActive', e.target.value)}
                >
                  <MenuItem value="">{t('admin.users.allUsers')}</MenuItem>
                  <MenuItem value="true">{t('admin.users.activeOnly')}</MenuItem>
                  <MenuItem value="false">{t('admin.users.inactiveOnly')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ height: 600 }}>
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row._id}
          rowCount={totalUsers}
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
            noRowsLabel: t('admin.users.noUsers')
          }}
        />
      </Paper>
      
      {/* Edit User Modal */}
      {selectedUser && (
        <AdminUserEditModal
          open={editModalOpen}
          onClose={handleCloseEditModal}
          user={selectedUser}
          onUserUpdate={handleUserUpdated}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
      >
        <DialogTitle>{t('admin.users.deleteTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('admin.users.deleteConfirmation', { username: userToDelete?.username })}
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }} color="error">
            {t('admin.users.deleteWarning')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>{t('common.cancel')}</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUserListPage;
