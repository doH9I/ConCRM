import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Flag,
  Schedule,
  Person,
  Assignment,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../../services/tasksApi';
import { projectsApi } from '../../services/projectsApi';
import { Task } from '../../types';
import dayjs from 'dayjs';

const statusColumns = [
  { key: 'todo', title: 'К выполнению', color: '#9e9e9e' },
  { key: 'in_progress', title: 'В работе', color: '#ff9800' },
  { key: 'review', title: 'На проверке', color: '#2196f3' },
  { key: 'completed', title: 'Завершено', color: '#4caf50' },
];

const TaskBoard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState('');

  // Запросы данных
  const { data: tasksResponse, isLoading, error } = useQuery({
    queryKey: ['tasks', { project_id: selectedProject }],
    queryFn: () => tasksApi.getTasks(selectedProject ? { project_id: selectedProject } : {}, 1, 100),
  });

  const { data: projectsResponse } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getProjects({}, 1, 100),
  });

  // Мутация обновления статуса
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      tasksApi.updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const tasks = tasksResponse?.data || [];
  const projects = projectsResponse?.data || [];

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

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: taskId, status: newStatus });
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const project = projects.find(p => p.id === task.project_id);
    const isOverdue = task.due_date && dayjs(task.due_date).isBefore(dayjs()) && task.status !== 'completed';

    return (
      <Card 
        sx={{ 
          mb: 2, 
          cursor: 'pointer',
          '&:hover': { boxShadow: 4 },
          border: isOverdue ? '2px solid #f44336' : 'none'
        }}
        onClick={() => navigate(`/tasks/detail/${task.id}`)}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          {/* Заголовок и приоритет */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ flexGrow: 1, mr: 1 }}>
              {task.title}
            </Typography>
            <Box display="flex" alignItems="center">
              <Flag 
                sx={{ 
                  color: getPriorityColor(task.priority), 
                  fontSize: 16 
                }} 
              />
              <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                <MoreVert fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Описание */}
          {task.description && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {task.description}
            </Typography>
          )}

          {/* Проект */}
          {project && (
            <Chip
              label={project.name}
              size="small"
              variant="outlined"
              sx={{ mb: 2, fontSize: '0.75rem' }}
            />
          )}

          {/* Дата и исполнитель */}
          <Box mb={2}>
            {task.due_date && (
              <Box display="flex" alignItems="center" mb={1}>
                <Schedule sx={{ fontSize: 14, mr: 0.5, color: isOverdue ? 'error.main' : 'text.secondary' }} />
                <Typography 
                  variant="caption" 
                  color={isOverdue ? 'error.main' : 'text.secondary'}
                >
                  {dayjs(task.due_date).format('DD.MM.YYYY')}
                </Typography>
              </Box>
            )}
            
            {task.assigned_to && (
              <Box display="flex" alignItems="center">
                <Avatar sx={{ width: 16, height: 16, mr: 0.5, fontSize: '0.75rem' }}>
                  {task.assigned_to.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  {task.assigned_to}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Прогресс */}
          {task.estimated_hours && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Прогресс
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {task.actual_hours || 0}ч / {task.estimated_hours}ч
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min((task.actual_hours || 0) / task.estimated_hours * 100, 100)}
                sx={{ height: 4, borderRadius: 2 }}
              />
            </Box>
          )}

          {/* Кнопки смены статуса */}
          <Box mt={2} display="flex" gap={1} flexWrap="wrap">
            {statusColumns
              .filter(col => col.key !== task.status)
              .slice(0, 2) // Показываем только 2 кнопки для экономии места
              .map(col => (
                <Button
                  key={col.key}
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(task.id, col.key);
                  }}
                  sx={{ 
                    fontSize: '0.7rem',
                    py: 0.25,
                    px: 1,
                    minWidth: 'auto',
                    borderColor: col.color,
                    color: col.color,
                    '&:hover': {
                      backgroundColor: col.color + '10',
                      borderColor: col.color,
                    }
                  }}
                >
                  {col.title}
                </Button>
              ))}
          </Box>
        </CardContent>
      </Card>
    );
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
          Доска задач
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Фильтр по проекту</InputLabel>
            <Select
              value={selectedProject}
              label="Фильтр по проекту"
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <MenuItem value="">Все проекты</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/tasks/create')}
          >
            Создать задачу
          </Button>
        </Box>
      </Box>

      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Kanban доска */}
      <Grid container spacing={2}>
        {statusColumns.map((column) => {
          const columnTasks = getTasksByStatus(column.key);
          
          return (
            <Grid item xs={12} sm={6} lg={3} key={column.key}>
              <Card sx={{ minHeight: 600, backgroundColor: 'grey.50' }}>
                <CardContent sx={{ p: 2 }}>
                  {/* Заголовок колонки */}
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="space-between" 
                    mb={2}
                    pb={1}
                    borderBottom={`2px solid ${column.color}`}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {column.title}
                    </Typography>
                    <Chip
                      label={columnTasks.length}
                      size="small"
                      sx={{ 
                        backgroundColor: column.color, 
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>

                  {/* Задачи в колонке */}
                  <Box>
                    {columnTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                    
                    {columnTasks.length === 0 && (
                      <Box 
                        display="flex" 
                        flexDirection="column" 
                        alignItems="center" 
                        justifyContent="center"
                        py={4}
                        sx={{ opacity: 0.5 }}
                      >
                        <Assignment sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Нет задач
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Итоговая статистика */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Статистика задач
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Typography variant="h4" color="text.secondary" fontWeight="bold">
                {getTasksByStatus('todo').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                К выполнению
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {getTasksByStatus('in_progress').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                В работе
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {getTasksByStatus('review').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                На проверке
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {getTasksByStatus('completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Завершено
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TaskBoard;