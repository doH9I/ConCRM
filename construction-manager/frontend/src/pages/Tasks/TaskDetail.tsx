import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  MoreVert,
  Assignment,
  Person,
  DateRange,
  Flag,
  Schedule,
  Comment,
  Add,
  AccessTime,
  Save,
  PlayArrow,
  Pause,
  CheckCircle,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../../services/tasksApi';
import { projectsApi } from '../../services/projectsApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`task-tabpanel-${index}`}
      aria-labelledby={`task-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [timeDialogOpen, setTimeDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [timeEntry, setTimeEntry] = useState({ hours: 0, description: '' });

  // Запросы данных
  const { data: task, isLoading, error } = useQuery({
    queryKey: ['task', id],
    queryFn: () => id ? tasksApi.getTask(id) : Promise.reject('No task ID'),
    enabled: !!id,
  });

  const { data: projectsResponse } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getProjects({}, 1, 100),
  });

  const { data: commentsResponse } = useQuery({
    queryKey: ['task-comments', id],
    queryFn: () => id ? tasksApi.getTaskComments(id) : Promise.resolve({ data: [] }),
    enabled: !!id,
  });

  const { data: timeEntriesResponse } = useQuery({
    queryKey: ['task-time', id],
    queryFn: () => id ? tasksApi.getTaskTimeEntries(id) : Promise.resolve({ data: [] }),
    enabled: !!id,
  });

  // Мутации
  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => tasksApi.updateTaskStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => tasksApi.addTaskComment(id!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', id] });
      setNewComment('');
      setCommentDialogOpen(false);
    },
  });

  const addTimeMutation = useMutation({
    mutationFn: ({ hours, description }: { hours: number; description: string }) => 
      tasksApi.addTimeEntry(id!, hours, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-time', id] });
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      setTimeEntry({ hours: 0, description: '' });
      setTimeDialogOpen(false);
    },
  });

  const projects = projectsResponse?.data || [];
  const comments = commentsResponse?.data || [];
  const timeEntries = timeEntriesResponse?.data || [];

  if (!id) {
    return <Alert severity="error">ID задачи не указан</Alert>;
  }

  if (error) {
    return <Alert severity="error">Ошибка загрузки задачи: {error.message}</Alert>;
  }

  if (isLoading || !task) {
    return <LinearProgress />;
  }

  const taskData = task.data;
  const project = projects.find(p => p.id === taskData.project_id);
  const isOverdue = taskData.due_date && dayjs(taskData.due_date).isBefore(dayjs()) && taskData.status !== 'completed';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'default';
      case 'in_progress': return 'warning';
      case 'review': return 'info';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return 'К выполнению';
      case 'in_progress': return 'В работе';
      case 'review': return 'На проверке';
      case 'completed': return 'Завершена';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#2196f3';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Срочно';
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return priority;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (newStatus: string) => {
    updateStatusMutation.mutate(newStatus);
    handleMenuClose();
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment);
    }
  };

  const handleAddTime = () => {
    if (timeEntry.hours > 0) {
      addTimeMutation.mutate(timeEntry);
    }
  };

  const calculateProgress = () => {
    if (!taskData.estimated_hours) return 0;
    return Math.min((taskData.actual_hours || 0) / taskData.estimated_hours * 100, 100);
  };

  return (
    <Box>
      {/* Заголовок */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/tasks')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box flexGrow={1}>
          <Typography variant="h4" fontWeight="bold">
            {taskData.title}
          </Typography>
          <Box display="flex" alignItems="center" gap={2} mt={1}>
            <Chip
              label={getStatusLabel(taskData.status)}
              color={getStatusColor(taskData.status)}
              size="small"
            />
            {isOverdue && (
              <Chip
                label="Просрочена"
                color="error"
                size="small"
              />
            )}
            <Typography variant="body2" color="text.secondary">
              Создана {dayjs(taskData.created_at).format('DD.MM.YYYY')}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            sx={{ mr: 1 }}
            onClick={() => navigate(`/tasks/edit/${id}`)}
          >
            Редактировать
          </Button>
          <IconButton onClick={handleMenuClick}>
            <MoreVert />
          </IconButton>
        </Box>
      </Box>

      {/* Основная информация */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Описание задачи
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {taskData.description || 'Описание не указано'}
              </Typography>
              
              <Box mt={3}>
                <Typography variant="h6" gutterBottom>
                  Прогресс выполнения
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box flexGrow={1} mr={2}>
                    <LinearProgress
                      variant="determinate"
                      value={calculateProgress()}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    {Math.round(calculateProgress())}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {taskData.actual_hours || 0} из {taskData.estimated_hours || 0} часов
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Основная информация
              </Typography>
              
              <Box mb={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Assignment sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Проект
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight="bold">
                  {project?.name || 'Неизвестный проект'}
                </Typography>
              </Box>

              <Box mb={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Flag sx={{ mr: 1, color: getPriorityColor(taskData.priority), fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Приоритет
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {getPriorityLabel(taskData.priority)}
                </Typography>
              </Box>

              <Box mb={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Person sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Исполнитель
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {taskData.assigned_to || 'Не назначен'}
                </Typography>
              </Box>

              <Box mb={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <DateRange sx={{ mr: 1, color: isOverdue ? 'error.main' : 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Крайний срок
                  </Typography>
                </Box>
                <Typography 
                  variant="body1"
                  color={isOverdue ? 'error.main' : 'text.primary'}
                >
                  {taskData.due_date ? dayjs(taskData.due_date).format('DD.MM.YYYY') : 'Не указан'}
                </Typography>
              </Box>

              <Box mb={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Schedule sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Время
                  </Typography>
                </Box>
                <Typography variant="body1">
                  План: {taskData.estimated_hours || 0} ч
                </Typography>
                <Typography variant="body1">
                  Факт: {taskData.actual_hours || 0} ч
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Вкладки */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<Comment />} label="Комментарии" />
            <Tab icon={<AccessTime />} label="Время" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              Комментарии
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCommentDialogOpen(true)}
            >
              Добавить комментарий
            </Button>
          </Box>

          <List>
            {comments.map((comment: any, index: number) => (
              <React.Fragment key={comment.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {comment.author_name?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" fontWeight="bold">
                          {comment.author_name || 'Неизвестный пользователь'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(comment.created_at).format('DD.MM.YYYY HH:mm')}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {comment.content}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < comments.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>

          {comments.length === 0 && (
            <Box textAlign="center" py={4}>
              <Comment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Комментариев пока нет
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              Учет времени
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setTimeDialogOpen(true)}
            >
              Добавить время
            </Button>
          </Box>

          <List>
            {timeEntries.map((entry: any, index: number) => (
              <React.Fragment key={entry.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <AccessTime />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" fontWeight="bold">
                          {entry.hours} часов
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(entry.date).format('DD.MM.YYYY')}
                        </Typography>
                      </Box>
                    }
                    secondary={entry.description || 'Без описания'}
                  />
                </ListItem>
                {index < timeEntries.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>

          {timeEntries.length === 0 && (
            <Box textAlign="center" py={4}>
              <AccessTime sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Записей времени пока нет
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Card>

      {/* Контекстное меню */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleStatusChange('in_progress')}>
          <ListItemIcon>
            <PlayArrow fontSize="small" color="warning" />
          </ListItemIcon>
          В работу
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('review')}>
          <ListItemIcon>
            <Pause fontSize="small" color="info" />
          </ListItemIcon>
          На проверку
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('completed')}>
          <ListItemIcon>
            <CheckCircle fontSize="small" color="success" />
          </ListItemIcon>
          Завершить
        </MenuItem>
      </Menu>

      {/* Диалог добавления комментария */}
      <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить комментарий</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Комментарий"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Отмена</Button>
          <Button 
            variant="contained" 
            onClick={handleAddComment}
            disabled={!newComment.trim() || addCommentMutation.isPending}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог добавления времени */}
      <Dialog open={timeDialogOpen} onClose={() => setTimeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить время</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Количество часов"
                value={timeEntry.hours || ''}
                onChange={(e) => setTimeEntry(prev => ({ ...prev, hours: Number(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Описание работы"
                value={timeEntry.description}
                onChange={(e) => setTimeEntry(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTimeDialogOpen(false)}>Отмена</Button>
          <Button 
            variant="contained" 
            onClick={handleAddTime}
            disabled={timeEntry.hours <= 0 || addTimeMutation.isPending}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskDetail;