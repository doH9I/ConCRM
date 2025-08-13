import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  Button,
  IconButton,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assignment,
  People,
  AccountBalance,
  Inventory,
  Warning,
  CheckCircle,
  Schedule,
  MoreVert,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

// Мокированные данные для демонстрации
const projectsData = [
  { name: 'Янв', active: 12, completed: 8 },
  { name: 'Фев', active: 15, completed: 10 },
  { name: 'Мар', active: 18, completed: 12 },
  { name: 'Апр', active: 20, completed: 15 },
  { name: 'Май', active: 22, completed: 18 },
  { name: 'Июн', active: 25, completed: 20 },
];

const financialData = [
  { name: 'Доходы', value: 2400000, color: '#4caf50' },
  { name: 'Расходы', value: 1800000, color: '#f44336' },
  { name: 'Прибыль', value: 600000, color: '#2196f3' },
];

const recentProjects = [
  { id: 1, name: 'Жилой комплекс "Север"', status: 'active', progress: 75 },
  { id: 2, name: 'Офисный центр "Бизнес-парк"', status: 'warning', progress: 45 },
  { id: 3, name: 'Торговый центр "Галерея"', status: 'completed', progress: 100 },
  { id: 4, name: 'Школа №125', status: 'active', progress: 30 },
];

const recentTasks = [
  { id: 1, title: 'Проверка качества фундамента', assignee: 'И. Петров', dueDate: '2024-01-15', priority: 'high' },
  { id: 2, title: 'Закупка строительных материалов', assignee: 'А. Сидоров', dueDate: '2024-01-16', priority: 'medium' },
  { id: 3, title: 'Составление сметы на отделку', assignee: 'М. Иванова', dueDate: '2024-01-17', priority: 'low' },
  { id: 4, title: 'Контроль монтажных работ', assignee: 'В. Козлов', dueDate: '2024-01-18', priority: 'high' },
];

const StatCard: React.FC<{
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactElement;
  color: string;
}> = ({ title, value, change, icon, color }) => (
  <Card>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold">
            {value}
          </Typography>
          <Box display="flex" alignItems="center" mt={1}>
            {change > 0 ? (
              <TrendingUp sx={{ color: 'success.main', mr: 0.5 }} fontSize="small" />
            ) : (
              <TrendingDown sx={{ color: 'error.main', mr: 0.5 }} fontSize="small" />
            )}
            <Typography
              variant="body2"
              color={change > 0 ? 'success.main' : 'error.main'}
            >
              {Math.abs(change)}% за месяц
            </Typography>
          </Box>
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Дашборд
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Обзор системы управления строительными проектами
      </Typography>

      {/* Статистические карточки */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <StatCard
            title="Активные проекты"
            value={25}
            change={12}
            icon={<Assignment />}
            color="#1976d2"
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <StatCard
            title="Сотрудники"
            value={148}
            change={5}
            icon={<People />}
            color="#4caf50"
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <StatCard
            title="Доходы (млн ₽)"
            value="2.4"
            change={8}
            icon={<TrendingUp />}
            color="#ff9800"
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <StatCard
            title="Материалы на складе"
            value={1250}
            change={-3}
            icon={<Inventory />}
            color="#9c27b0"
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* График проектов */}
        <Box sx={{ flex: '2 1 500px', minWidth: '400px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Статистика проектов
              </Typography>
              <Box 
                sx={{ 
                  height: 300, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: 'grey.50',
                  borderRadius: 1
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  График статистики проектов
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Финансовая диаграмма */}
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Распределение бюджета
              </Typography>
              <Box 
                sx={{ 
                  height: 300, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: 'grey.50',
                  borderRadius: 1
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Диаграмма бюджета
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Последние проекты */}
        <Box sx={{ flex: '1 1 400px', minWidth: '350px' }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">
                  Последние проекты
                </Typography>
                <Button size="small">Посмотреть все</Button>
              </Box>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>1</Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="Жилой комплекс 'Солнечный'"
                    secondary="Статус: В работе"
                  />
                  <Chip label="Активен" color="success" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>2</Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="Офисный центр 'Бизнес-плаза'"
                    secondary="Статус: Планирование"
                  />
                  <Chip label="Планирование" color="warning" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>3</Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="Торговый центр 'Мега'"
                    secondary="Статус: Завершен"
                  />
                  <Chip label="Завершен" color="success" size="small" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Последние задачи */}
        <Box sx={{ flex: '1 1 400px', minWidth: '350px' }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">
                  Текущие задачи
                </Typography>
                <Button size="small">Посмотреть все</Button>
              </Box>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>!</Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="Проверка качества материалов"
                    secondary="Срок: сегодня"
                  />
                  <Chip label="Высокий" color="error" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'info.main' }}>2</Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="Согласование сметы"
                    secondary="Срок: завтра"
                  />
                  <Chip label="Средний" color="warning" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'success.main' }}>3</Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="Обновление документации"
                    secondary="Срок: на неделе"
                  />
                  <Chip label="Низкий" color="info" size="small" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;