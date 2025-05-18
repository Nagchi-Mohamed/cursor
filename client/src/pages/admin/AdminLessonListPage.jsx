import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon } from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';
import adminLessonService from '../../services/adminLessonService';

const AdminLessonListPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  useEffect(() => {
    fetchLessons();
  }, [paginationModel, searchQuery, categoryFilter, difficultyFilter]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const params = {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: searchQuery,
        category: categoryFilter,
        difficulty: difficultyFilter,
      };

      const response = await adminLessonService.getLessons(params);
      setLessons(response.data.lessons);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.confirmDelete'))) {
      try {
        await adminLessonService.deleteLesson(id);
        fetchLessons();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const columns = [
    { field: 'title', headerName: t('admin.title'), flex: 1 },
    { field: 'category', headerName: t('admin.category'), width: 130 },
    { field: 'difficulty', headerName: t('admin.difficulty'), width: 130 },
    {
      field: 'status',
      headerName: t('admin.status'),
      width: 130,
      renderCell: (params) => (
        <span style={{ color: params.value === 'published' ? 'green' : 'orange' }}>
          {t(`admin.status.${params.value}`)}
        </span>
      ),
    },
    {
      field: 'createdAt',
      headerName: t('admin.createdAt'),
      width: 180,
      valueGetter: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: t('admin.actions'),
      width: 200,
      renderCell: (params) => (
        <Box>
          <Button
            size="small"
            onClick={() => navigate(`/admin/lessons/edit/${params.row.id}`)}
          >
            {t('admin.edit')}
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.id)}
          >
            {t('admin.delete')}
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">{t('admin.lessons')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/lessons/new')}
        >
          {t('admin.createLesson')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          label={t('admin.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{t('admin.category')}</InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            label={t('admin.category')}
          >
            <MenuItem value="">{t('admin.all')}</MenuItem>
            <MenuItem value="algebra">{t('categories.algebra')}</MenuItem>
            <MenuItem value="geometry">{t('categories.geometry')}</MenuItem>
            <MenuItem value="calculus">{t('categories.calculus')}</MenuItem>
            <MenuItem value="statistics">{t('categories.statistics')}</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{t('admin.difficulty')}</InputLabel>
          <Select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            label={t('admin.difficulty')}
          >
            <MenuItem value="">{t('admin.all')}</MenuItem>
            <MenuItem value="beginner">{t('difficulty.beginner')}</MenuItem>
            <MenuItem value="intermediate">{t('difficulty.intermediate')}</MenuItem>
            <MenuItem value="advanced">{t('difficulty.advanced')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={lessons}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          loading={loading}
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default AdminLessonListPage; 