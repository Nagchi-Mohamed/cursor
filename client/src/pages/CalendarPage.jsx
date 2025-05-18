import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
} from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const CalendarPage = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Calculus Study Group',
      date: new Date(2024, 2, 15, 18, 0),
      duration: 120,
      type: 'study',
      participants: ['John D.', 'Sarah M.'],
    },
    // Add more sample events
  ]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: new Date(),
    duration: 60,
    type: 'study',
    description: '',
  });

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setCreateDialogOpen(false);
    setNewEvent({
      title: '',
      date: new Date(),
      duration: 60,
      type: 'study',
      description: '',
    });
  };

  const handleSubmitEvent = () => {
    // TODO: Implement create event functionality
    handleCloseDialog();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<Box key={`empty-${i}`} sx={{ p: 2 }} />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = events.filter(event => 
        event.date.getDate() === day &&
        event.date.getMonth() === currentDate.getMonth() &&
        event.date.getFullYear() === currentDate.getFullYear()
      );

      days.push(
        <Box
          key={day}
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            minHeight: 120,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
          onClick={() => handleDateClick(date)}
        >
          <Typography variant="subtitle2" gutterBottom>
            {day}
          </Typography>
          {dayEvents.map(event => (
            <Chip
              key={event.id}
              label={event.title}
              size="small"
              color={event.type === 'study' ? 'primary' : 'secondary'}
              sx={{ mb: 0.5 }}
            />
          ))}
        </Box>
      );
    }

    return days;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('calendar')}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handlePrevMonth}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6" sx={{ mx: 2 }}>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Typography>
          <IconButton onClick={handleNextMonth}>
            <ChevronRightIcon />
          </IconButton>
          <Button
            startIcon={<TodayIcon />}
            onClick={handleToday}
            sx={{ ml: 2 }}
          >
            {t('today')}
          </Button>
          {isAuthenticated && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{ ml: 'auto' }}
            >
              {t('addEvent')}
            </Button>
          )}
        </Box>
      </Box>

      <Paper>
        <Grid container>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Grid item xs key={day} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>
        <Grid container>
          {renderCalendar()}
        </Grid>
      </Paper>

      <Dialog open={createDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{t('addEvent')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label={t('eventTitle')}
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              fullWidth
            />
            <TextField
              label={t('date')}
              type="datetime-local"
              value={newEvent.date.toISOString().slice(0, 16)}
              onChange={(e) => setNewEvent({ ...newEvent, date: new Date(e.target.value) })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>{t('duration')}</InputLabel>
              <Select
                value={newEvent.duration}
                onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })}
                label={t('duration')}
              >
                {[30, 60, 90, 120].map((minutes) => (
                  <MenuItem key={minutes} value={minutes}>
                    {minutes} {t('minutes')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>{t('eventType')}</InputLabel>
              <Select
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                label={t('eventType')}
              >
                <MenuItem value="study">{t('study')}</MenuItem>
                <MenuItem value="exam">{t('exam')}</MenuItem>
                <MenuItem value="other">{t('other')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={t('description')}
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('cancel')}</Button>
          <Button onClick={handleSubmitEvent} variant="contained">
            {t('create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CalendarPage; 