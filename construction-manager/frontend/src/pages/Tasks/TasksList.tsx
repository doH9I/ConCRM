import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  InputAdornment,
  LinearProgress,
  Avatar,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  PlayArrow,
  Pause,
  CheckCircle,
  Schedule,
  Flag,
  Person,
  Assignment,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../../services/tasksApi';
import { projectsApi } from '../../services/projectsApi';
import { Task, TaskFilters } from '../../types';

const TasksList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<TaskFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // Запросы данных
  const { data: tasksResponse, isLoading, error } = useQuery({
    queryKey: ['tasks', filters, searchQuery, page],
    queryFn: () => tasksApi.getTasks({ ...filters, query: searchQuery }, page, 20),
  });

  const { data: projectsResponse } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getProjects({}, 1, 100),
  });

  // Мутации
  const deleteTaskMutation = useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      handleMenuClose();
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      tasksApi.updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const tasks = tasksResponse?.data || [];
  const projects = projectsResponse?.data || [];

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, taskId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(taskId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleViewTask = () => {
    if (selectedTask) {
      navigate(`/tasks/detail/${selectedTask}`);
    }
    handleMenuClose();
  };

  const handleEditTask = () => {
    if (selectedTask) {
      navigate(`/tasks/edit/${selectedTask}`);
    }
    handleMenuClose();
  };

  const handleDeleteTask = () => {
    if (selectedTask) {
      deleteTaskMutation.mutate(selectedTask);
    }
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTaskStatusMutation.mutate({ id: taskId, status: newStatus });
  };

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

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Ошибка загрузки задач: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Задачи
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/tasks/create')}
        >
          Создать задачу
        </Button>
      </Box>

      {/* Фильтры */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Поиск по названию"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Проект</InputLabel>
                <Select
                  value={filters.project_id || ''}
                  label="Проект"
                  onChange={(e) => setFilters(prev => ({ ...prev, project_id: e.target.value }))}
                >
                  <MenuItem value="">Все</MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={filters.status || ''}
                  label="Статус"
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="">Все</MenuItem>
                  <MenuItem value="todo">К выполнению</MenuItem>
                  <MenuItem value="in_progress">В работе</MenuItem>
                  <MenuItem value="review">На проверке</MenuItem>
                  <MenuItem value="completed">Завершена</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Приоритет</InputLabel>
                <Select
                  value={filters.priority || ''}
                  label="Приоритет"
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <MenuItem value="">Все</MenuItem>
                  <MenuItem value="urgent">Срочно</MenuItem>
                  <MenuItem value="high">Высокий</MenuItem>
                  <MenuItem value="medium">Средний</MenuItem>
                  <MenuItem value="low">Низкий</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setFilters({});
                  setSearchQuery('');
                }}
              >
                Очистить фильтры
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Загрузка */}
      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Таблица задач */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Задача</TableCell>
                  <TableCell>Проект</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Приоритет</TableCell>
                  <TableCell>Исполнитель</TableCell>
                  <TableCell>Срок</TableCell>
                  <TableCell>Прогресс</TableCell>
                  <TableCell align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => {
                  const project = projects.find(p => p.id === task.project_id);
                  const isOverdue = task.due_date && dayjs(task.due_date).isBefore(dayjs()) && task.status !== 'completed';
                  
                  return (
                    <TableRow 
                      key={task.id} 
                      hover 
                      sx={{ 
                        cursor: 'pointer',
                        backgroundColor: isOverdue ? 'error.light' : 'inherit',
                        '&:hover': {
                          backgroundColor: isOverdue ? 'error.main' : 'action.hover',
                        }
                      }}
                      onClick={() => navigate(`/tasks/detail/${task.id}`)}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {task.title}
                          </Typography>
                          {task.description && (
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {task.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project?.name || 'Неизвестно'}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(task.status)}
                          color={getStatusColor(task.status)}
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Здесь можно добавить быстрое изменение статуса
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Flag 
                            sx={{ 
                              color: getPriorityColor(task.priority), 
                              mr: 0.5,
                              fontSize: 16 
                            }} 
                          />
                          <Typography variant="body2">
                            {getPriorityLabel(task.priority)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {task.assigned_to ? (
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: 12 }}>
                              {task.assigned_to.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2">
                              {task.assigned_to}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Не назначен
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.due_date ? (
                          <Box display="flex" alignItems="center">
                            <Schedule sx={{ fontSize: 16, mr: 0.5, color: isOverdue ? 'error.main' : 'text.secondary' }} />
                            <Typography 
                              variant="body2" 
                              color={isOverdue ? 'error.main' : 'text.primary'}
                            >
                              {dayjs(task.due_date).format('DD.MM.YYYY')}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Не указан
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={task.actual_hours && task.estimated_hours ? 
                              Math.min((task.actual_hours / task.estimated_hours) * 100, 100) : 0}
                            sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="body2" fontSize="0.75rem">
                            {task.actual_hours || 0}ч / {task.estimated_hours || 0}ч
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuClick(e, task.id);
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {tasks.length === 0 && !isLoading && (
            <Box textAlign="center" py={8}>
              <Assignment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Задачи не найдены
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Попробуйте изменить критерии поиска или создайте новую задачу
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/tasks/create')}
              >
                Создать первую задачу
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Контекстное меню */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewTask}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>Просмотр</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditTask}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Редактировать</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => selectedTask && handleStatusChange(selectedTask, 'in_progress')}>
          <ListItemIcon>
            <PlayArrow fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText>Начать выполнение</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedTask && handleStatusChange(selectedTask, 'completed')}>
          <ListItemIcon>
            <CheckCircle fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>Завершить</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteTask} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TasksList;