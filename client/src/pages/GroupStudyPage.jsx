import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  IconButton,
  Chip,
  Avatar,
  AvatarGroup,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  VideoCall as VideoCallIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const GroupStudyPage = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    subject: '',
    maxMembers: 4,
    description: '',
  });

  useEffect(() => {
    // TODO: Fetch study groups from API
    const fetchGroups = async () => {
      try {
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setGroups([
          {
            id: 1,
            name: 'Calculus Study Group',
            subject: 'Calculus',
            description: 'Weekly study sessions for Calculus II',
            members: ['John D.', 'Sarah M.', 'Mike R.'],
            maxMembers: 4,
            schedule: 'Every Monday, 6 PM',
            status: 'active',
          },
          // Add more sample groups
        ]);
      } catch (error) {
        console.error('Error fetching study groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleCreateGroup = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setCreateDialogOpen(false);
    setNewGroup({
      name: '',
      subject: '',
      maxMembers: 4,
      description: '',
    });
  };

  const handleSubmitGroup = () => {
    // TODO: Implement create group functionality
    handleCloseDialog();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('groupStudy')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <IconButton>
            <FilterIcon />
          </IconButton>
          <IconButton>
            <SortIcon />
          </IconButton>
          {isAuthenticated && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateGroup}
            >
              {t('createGroup')}
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {groups.map((group) => (
          <Grid item xs={12} md={6} key={group.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {group.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {group.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip label={group.subject} size="small" />
                  <Chip
                    label={`${group.members.length}/${group.maxMembers} members`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={group.status}
                    size="small"
                    color={group.status === 'active' ? 'success' : 'default'}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {t('schedule')}:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {group.schedule}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {t('members')}:
                  </Typography>
                  <AvatarGroup max={4}>
                    {group.members.map((member, index) => (
                      <Avatar key={index}>{member[0]}</Avatar>
                    ))}
                  </AvatarGroup>
                </Box>
              </CardContent>
              <Divider />
              <CardActions>
                <Button
                  size="small"
                  startIcon={<VideoCallIcon />}
                >
                  {t('joinCall')}
                </Button>
                <Button
                  size="small"
                  startIcon={<ChatIcon />}
                >
                  {t('chat')}
                </Button>
                {isAuthenticated && (
                  <Button size="small" color="primary">
                    {t('join')}
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={createDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{t('createGroup')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label={t('groupName')}
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              fullWidth
            />
            <TextField
              label={t('subject')}
              value={newGroup.subject}
              onChange={(e) => setNewGroup({ ...newGroup, subject: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>{t('maxMembers')}</InputLabel>
              <Select
                value={newGroup.maxMembers}
                onChange={(e) => setNewGroup({ ...newGroup, maxMembers: e.target.value })}
                label={t('maxMembers')}
              >
                {[2, 3, 4, 5, 6].map((num) => (
                  <MenuItem key={num} value={num}>
                    {num}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={t('description')}
              value={newGroup.description}
              onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('cancel')}</Button>
          <Button onClick={handleSubmitGroup} variant="contained">
            {t('create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GroupStudyPage; 