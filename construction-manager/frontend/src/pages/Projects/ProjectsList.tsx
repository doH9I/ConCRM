import React, { useState } from 'react';
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
  LinearProgress,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Assignment,
  DateRange,
  AccountBalance,
  Person,
  BusinessCenter,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

// Мокированные данные для демонстрации
const mockProjects = [
  {
    id: '1',
    name: 'Жилой комплекс "Северная звезда"',
    description: 'Строительство многоэтажного жилого комплекса',
    status: 'active' as const,
    start_date: '2024-01-15',
    end_date: '2024-12-31',
    budget: 50000000,
    client_name: 'ООО "СтройИнвест"',
    client_contact: '+7 (495) 123-45-67',
    manager_id: 'user1',
    manager_name: 'Иванов И.И.',
    address: 'г. Москва, ул. Северная, д. 1',
    progress: 65,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-14T15:30:00Z',
  },
  {
    id: '2',
    name: 'Офисный центр "Бизнес-парк"',
    description: 'Строительство современного офисного центра',
    status: 'planning' as const,
    start_date: '2024-02-01',
    end_date: '2024-10-31',
    budget: 75000000,
    client_name: 'АО "Развитие"',
    client_contact: '+7 (495) 987-65-43',
    manager_id: 'user2',
    manager_name: 'Петров П.П.',
    address: 'г. Москва, ул. Деловая, д. 15',
    progress: 25,
    created_at: '2024-01-05T09:00:00Z',
    updated_at: '2024-01-12T11:20:00Z',
  },
  {
    id: '3',
    name: 'Торговый центр "Галерея"',
    description: 'Реконструкция торгового центра',
    status: 'completed' as const,
    start_date: '2023-06-01',
    end_date: '2023-12-20',
    budget: 30000000,
    client_name: 'ООО "РетейлГрупп"',
    client_contact: '+7 (495) 555-77-99',
    manager_id: 'user3',
    manager_name: 'Сидорова А.В.',
    address: 'г. Москва, пр-т Мира, д. 88',
    progress: 100,
    created_at: '2023-05-15T14:00:00Z',
    updated_at: '2023-12-20T16:45:00Z',
  },
  {
    id: '4',
    name: 'Школа №125',
    description: 'Капитальный ремонт образовательного учреждения',
    status: 'on_hold' as const,
    start_date: '2024-03-01',
    end_date: '2024-08-31',
    budget: 15000000,
    client_name: 'Департамент образования',
    client_contact: '+7 (495) 444-88-22',
    manager_id: 'user1',
    manager_name: 'Иванов И.И.',
    address: 'г. Москва, ул. Школьная, д. 125',
    progress: 10,
    created_at: '2024-02-10T12:00:00Z',
    updated_at: '2024-02-25T09:15:00Z',
  },
];

const statusLabels = {
  planning: 'Планирование',
  active: 'Активный',
  on_hold: 'Приостановлен',
  completed: 'Завершен',
  cancelled: 'Отменен',
};

const statusColors = {
  planning: 'warning',
  active: 'success',
  on_hold: 'error',
  completed: 'primary',
  cancelled: 'default',
} as const;

const ProjectsList: React.FC = () => {
  const navigate = useNavigate();
  const [projects] = useState(mockProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [managerFilter, setManagerFilter] = useState('');
  const [dateFrom, setDateFrom] = useState<dayjs.Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<dayjs.Dayjs | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, projectId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(projectId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const handleViewProject = () => {
    if (selectedProject) {
      navigate(`/projects/detail/${selectedProject}`);
    }
    handleMenuClose();
  };

  const handleEditProject = () => {
    if (selectedProject) {
      navigate(`/projects/edit/${selectedProject}`);
    }
    handleMenuClose();
  };

  const handleDeleteProject = () => {
    // Здесь будет логика удаления проекта
    console.log('Delete project:', selectedProject);
    handleMenuClose();
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchQuery || 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || project.status === statusFilter;
    const matchesManager = !managerFilter || project.manager_id === managerFilter;
    
    const projectDate = dayjs(project.start_date);
    const matchesDateFrom = !dateFrom || projectDate.isAfter(dateFrom) || projectDate.isSame(dateFrom);
    const matchesDateTo = !dateTo || projectDate.isBefore(dateTo) || projectDate.isSame(dateTo);

    return matchesSearch && matchesStatus && matchesManager && matchesDateFrom && matchesDateTo;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Проекты
        </Typography>
        <Button
          variant="contained"
          startIcon={<Assignment />}
          onClick={() => navigate('/projects/create')}
        >
          Создать проект
        </Button>
      </Box>

      {/* Фильтры */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Поиск"
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
                <InputLabel>Статус</InputLabel>
                <Select
                  value={statusFilter}
                  label="Статус"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">Все</MenuItem>
                  <MenuItem value="planning">Планирование</MenuItem>
                  <MenuItem value="active">Активный</MenuItem>
                  <MenuItem value="on_hold">Приостановлен</MenuItem>
                  <MenuItem value="completed">Завершен</MenuItem>
                  <MenuItem value="cancelled">Отменен</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <DatePicker
                label="Дата с"
                value={dateFrom}
                onChange={(newValue) => setDateFrom(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <DatePicker
                label="Дата по"
                value={dateTo}
                onChange={(newValue) => setDateTo(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                  setManagerFilter('');
                  setDateFrom(null);
                  setDateTo(null);
                }}
              >
                Очистить фильтры
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Список проектов */}
      <Grid container spacing={3}>
        {filteredProjects.map((project) => (
          <Grid item xs={12} md={6} lg={4} key={project.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate(`/projects/detail/${project.id}`)}
            >
              <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box flexGrow={1}>
                    <Typography variant="h6" gutterBottom noWrap>
                      {project.name}
                    </Typography>
                    <Chip
                      label={statusLabels[project.status]}
                      color={statusColors[project.status]}
                      size="small"
                    />
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuClick(e, project.id);
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2} sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {project.description}
                </Typography>

                <Box mb={2}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <BusinessCenter sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {project.client_name}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Person sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {project.manager_name}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <AccountBalance sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(project.budget)}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <DateRange sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {dayjs(project.start_date).format('DD.MM.YYYY')} - {dayjs(project.end_date).format('DD.MM.YYYY')}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Прогресс
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {project.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={project.progress} 
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredProjects.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Проекты не найдены
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Попробуйте изменить критерии поиска или создайте новый проект
          </Typography>
          <Button
            variant="contained"
            startIcon={<Assignment />}
            onClick={() => navigate('/projects/create')}
          >
            Создать первый проект
          </Button>
        </Box>
      )}

      {/* Контекстное меню */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewProject}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>Просмотр</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditProject}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Редактировать</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteProject} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ProjectsList;