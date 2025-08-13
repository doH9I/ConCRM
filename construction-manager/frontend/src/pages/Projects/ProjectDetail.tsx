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
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  MoreVert,
  Business,
  Person,
  DateRange,
  AccountBalance,
  LocationOn,
  Phone,
  Task,
  Assignment,
  AttachMoney,
  Timeline,
} from '@mui/icons-material';
import dayjs from 'dayjs';

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
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Мокированные данные проекта
const mockProject = {
  id: '1',
  name: 'Жилой комплекс "Северная звезда"',
  description: 'Строительство многоэтажного жилого комплекса класса комфорт с подземным паркингом и благоустроенной территорией',
  status: 'active' as const,
  start_date: '2024-01-15',
  end_date: '2024-12-31',
  budget: 50000000,
  actual_cost: 32500000,
  client_name: 'ООО "СтройИнвест"',
  client_contact: '+7 (495) 123-45-67',
  manager_id: 'user1',
  manager_name: 'Иванов Иван Иванович',
  address: 'г. Москва, ул. Северная, д. 1',
  progress: 65,
  created_at: '2024-01-10T10:00:00Z',
  updated_at: '2024-01-14T15:30:00Z',
};

const mockTasks = [
  { id: '1', title: 'Разработка проектной документации', status: 'completed', assignee: 'Петров П.П.', due_date: '2024-02-01', progress: 100 },
  { id: '2', title: 'Получение разрешений', status: 'completed', assignee: 'Сидорова А.В.', due_date: '2024-02-15', progress: 100 },
  { id: '3', title: 'Земляные работы', status: 'completed', assignee: 'Козлов В.И.', due_date: '2024-03-01', progress: 100 },
  { id: '4', title: 'Возведение фундамента', status: 'completed', assignee: 'Морозов С.А.', due_date: '2024-04-01', progress: 100 },
  { id: '5', title: 'Возведение каркаса здания', status: 'in_progress', assignee: 'Морозов С.А.', due_date: '2024-08-01', progress: 75 },
  { id: '6', title: 'Кровельные работы', status: 'todo', assignee: 'Федоров Д.Н.', due_date: '2024-09-01', progress: 0 },
  { id: '7', title: 'Отделочные работы', status: 'todo', assignee: 'Белова М.К.', due_date: '2024-11-01', progress: 0 },
];

const mockStages = [
  { id: '1', name: 'Подготовительные работы', status: 'completed', progress: 100, budget: 2000000, actual_cost: 1950000 },
  { id: '2', name: 'Фундаментные работы', status: 'completed', progress: 100, budget: 8000000, actual_cost: 8200000 },
  { id: '3', name: 'Возведение каркаса', status: 'in_progress', progress: 75, budget: 25000000, actual_cost: 18750000 },
  { id: '4', name: 'Кровельные работы', status: 'pending', progress: 0, budget: 5000000, actual_cost: 0 },
  { id: '5', name: 'Отделочные работы', status: 'pending', progress: 0, budget: 10000000, actual_cost: 0 },
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

const taskStatusLabels = {
  todo: 'К выполнению',
  in_progress: 'В работе',
  review: 'На проверке',
  completed: 'Завершена',
};

const taskStatusColors = {
  todo: 'default',
  in_progress: 'warning',
  review: 'info',
  completed: 'success',
} as const;

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgressColor = (progress: number) => {
    if (progress >= 90) return 'success';
    if (progress >= 70) return 'info';
    if (progress >= 50) return 'warning';
    return 'error';
  };

  return (
    <Box>
      {/* Заголовок */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/projects')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box flexGrow={1}>
          <Typography variant="h4" fontWeight="bold">
            {mockProject.name}
          </Typography>
          <Box display="flex" alignItems="center" gap={2} mt={1}>
            <Chip
              label={statusLabels[mockProject.status]}
              color={statusColors[mockProject.status]}
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              Создан {dayjs(mockProject.created_at).format('DD.MM.YYYY')}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            sx={{ mr: 1 }}
            onClick={() => navigate(`/projects/edit/${id}`)}
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
                Описание проекта
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {mockProject.description}
              </Typography>
              
              <Box mt={3}>
                <Typography variant="h6" gutterBottom>
                  Прогресс выполнения
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box flexGrow={1} mr={2}>
                    <LinearProgress
                      variant="determinate"
                      value={mockProject.progress}
                      color={calculateProgressColor(mockProject.progress)}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    {mockProject.progress}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Завершено {mockProject.progress}% от общего объема работ
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
                  <Business sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Клиент
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight="bold">
                  {mockProject.client_name}
                </Typography>
              </Box>

              <Box mb={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Phone sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Контакт
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {mockProject.client_contact}
                </Typography>
              </Box>

              <Box mb={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Person sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Менеджер
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {mockProject.manager_name}
                </Typography>
              </Box>

              <Box mb={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <LocationOn sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Адрес
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {mockProject.address}
                </Typography>
              </Box>

              <Box mb={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <DateRange sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Сроки
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {dayjs(mockProject.start_date).format('DD.MM.YYYY')} - {dayjs(mockProject.end_date).format('DD.MM.YYYY')}
                </Typography>
              </Box>

              <Box mb={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <AccountBalance sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Бюджет
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight="bold">
                  {formatCurrency(mockProject.budget)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Потрачено: {formatCurrency(mockProject.actual_cost)}
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
            <Tab icon={<Task />} label="Задачи" />
            <Tab icon={<Timeline />} label="Этапы" />
            <Tab icon={<AttachMoney />} label="Финансы" />
            <Tab icon={<Assignment />} label="Документы" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Задачи проекта
          </Typography>
          <List>
            {mockTasks.map((task, index) => (
              <React.Fragment key={task.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Task />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1">
                          {task.title}
                        </Typography>
                        <Chip
                          label={taskStatusLabels[task.status as keyof typeof taskStatusLabels]}
                          color={taskStatusColors[task.status as keyof typeof taskStatusColors]}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box mt={1}>
                        <Typography variant="body2" color="text.secondary">
                          Исполнитель: {task.assignee} • Срок: {dayjs(task.due_date).format('DD.MM.YYYY')}
                        </Typography>
                        <Box mt={1}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box flexGrow={1}>
                              <LinearProgress
                                variant="determinate"
                                value={task.progress}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                            <Typography variant="body2" fontWeight="bold">
                              {task.progress}%
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < mockTasks.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Этапы проекта
          </Typography>
          <Grid container spacing={2}>
            {mockStages.map((stage) => (
              <Grid item xs={12} md={6} key={stage.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        {stage.name}
                      </Typography>
                      <Chip
                        label={stage.status === 'completed' ? 'Завершен' : stage.status === 'in_progress' ? 'В работе' : 'Ожидает'}
                        color={stage.status === 'completed' ? 'success' : stage.status === 'in_progress' ? 'warning' : 'default'}
                        size="small"
                      />
                    </Box>
                    
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Прогресс
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {stage.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={stage.progress}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Бюджет
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(stage.budget)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Потрачено
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(stage.actual_cost)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Финансовая информация
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(mockProject.budget)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Общий бюджет
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" color="warning.main">
                    {formatCurrency(mockProject.actual_cost)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Потрачено
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(mockProject.budget - mockProject.actual_cost)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Остаток
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Документы проекта
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Раздел документов будет реализован в следующих версиях
          </Typography>
        </TabPanel>
      </Card>

      {/* Контекстное меню */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { navigate(`/projects/edit/${id}`); handleMenuClose(); }}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          Редактировать
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ProjectDetail;