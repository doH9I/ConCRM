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
  Alert,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  BugReport,
  Assignment,
  Person,
  Schedule,
  Flag,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';

// Пока используем мок-данные, позже подключим API
const mockDefects = [
  {
    id: '1',
    title: 'Трещина в стене',
    description: 'Обнаружена трещина в несущей стене на 3 этаже',
    severity: 'high',
    status: 'open',
    project_id: '1',
    project_name: 'ЖК Солнечный',
    location: 'Блок А, 3 этаж, квартира 25',
    assigned_to: 'Иванов И.И.',
    created_at: '2024-01-15',
    due_date: '2024-01-20',
    priority: 'urgent',
  },
  {
    id: '2',
    title: 'Протечка кровли',
    description: 'Протечка в районе технического этажа',
    severity: 'medium',
    status: 'in_progress',
    project_id: '2',
    project_name: 'Офисный центр Бизнес-Плаза',
    location: 'Техэтаж, секция Б',
    assigned_to: 'Петров П.П.',
    created_at: '2024-01-12',
    due_date: '2024-01-18',
    priority: 'high',
  },
];

const Defects: React.FC = () => {
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDefect, setSelectedDefect] = useState<string | null>(null);

  const defects = mockDefects.filter(defect => {
    const matchesSearch = !searchQuery || 
      defect.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      defect.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || defect.status === statusFilter;
    const matchesSeverity = !severityFilter || defect.severity === severityFilter;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, defectId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedDefect(defectId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDefect(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'in_progress': return 'warning';
      case 'resolved': return 'info';
      case 'closed': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Открыт';
      case 'in_progress': return 'В работе';
      case 'resolved': return 'Решен';
      case 'closed': return 'Закрыт';
      default: return status;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'high': return '#f44336';
      case 'critical': return '#9c27b0';
      default: return '#9e9e9e';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'low': return 'Низкая';
      case 'medium': return 'Средняя';
      case 'high': return 'Высокая';
      case 'critical': return 'Критическая';
      default: return severity;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <CheckCircle />;
      case 'medium': return <Warning />;
      case 'high': return <ErrorIcon />;
      case 'critical': return <BugReport />;
      default: return <BugReport />;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Учет дефектов
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/defects/create')}
        >
          Зарегистрировать дефект
        </Button>
      </Box>

      {/* Фильтры */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Поиск по названию, описанию"
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
                  <MenuItem value="open">Открыт</MenuItem>
                  <MenuItem value="in_progress">В работе</MenuItem>
                  <MenuItem value="resolved">Решен</MenuItem>
                  <MenuItem value="closed">Закрыт</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Серьезность</InputLabel>
                <Select
                  value={severityFilter}
                  label="Серьезность"
                  onChange={(e) => setSeverityFilter(e.target.value)}
                >
                  <MenuItem value="">Все</MenuItem>
                  <MenuItem value="low">Низкая</MenuItem>
                  <MenuItem value="medium">Средняя</MenuItem>
                  <MenuItem value="high">Высокая</MenuItem>
                  <MenuItem value="critical">Критическая</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                  setSeverityFilter('');
                }}
              >
                Очистить фильтры
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Статистика */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="error.main">
                {defects.filter(d => d.status === 'open').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Открытых дефектов
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                {defects.filter(d => d.status === 'in_progress').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                В работе
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="info.main">
                {defects.filter(d => d.status === 'resolved').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Решено
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {defects.filter(d => d.status === 'closed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Закрыто
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Таблица дефектов */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Дефект</TableCell>
                  <TableCell>Проект</TableCell>
                  <TableCell>Серьезность</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Исполнитель</TableCell>
                  <TableCell>Срок</TableCell>
                  <TableCell align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {defects.map((defect) => {
                  const isOverdue = defect.due_date && dayjs(defect.due_date).isBefore(dayjs()) && defect.status !== 'closed';

                  return (
                    <TableRow 
                      key={defect.id} 
                      hover 
                      sx={{ 
                        cursor: 'pointer',
                        backgroundColor: isOverdue ? 'error.light' : 'inherit',
                      }}
                      onClick={() => navigate(`/defects/detail/${defect.id}`)}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: getSeverityColor(defect.severity) }}>
                            {getSeverityIcon(defect.severity)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {defect.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {defect.location}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={defect.project_name}
                          variant="outlined"
                          size="small"
                          icon={<Assignment />}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Flag sx={{ color: getSeverityColor(defect.severity), mr: 0.5, fontSize: 16 }} />
                          <Typography variant="body2">
                            {getSeverityLabel(defect.severity)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(defect.status)}
                          color={getStatusColor(defect.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {defect.assigned_to ? (
                          <Box display="flex" alignItems="center">
                            <Person sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {defect.assigned_to}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Не назначен
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {defect.due_date ? (
                          <Box display="flex" alignItems="center">
                            <Schedule sx={{ 
                              fontSize: 16, 
                              mr: 0.5, 
                              color: isOverdue ? 'error.main' : 'text.secondary' 
                            }} />
                            <Typography 
                              variant="body2"
                              color={isOverdue ? 'error.main' : 'text.primary'}
                            >
                              {dayjs(defect.due_date).format('DD.MM.YYYY')}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Не указан
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuClick(e, defect.id);
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

          {defects.length === 0 && (
            <Box textAlign="center" py={8}>
              <BugReport sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Дефекты не найдены
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Попробуйте изменить критерии поиска или зарегистрируйте новый дефект
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/defects/create')}
              >
                Зарегистрировать дефект
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
        <MenuItem onClick={() => {
          if (selectedDefect) navigate(`/defects/detail/${selectedDefect}`);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>Просмотр</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedDefect) navigate(`/defects/edit/${selectedDefect}`);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Редактировать</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Defects;