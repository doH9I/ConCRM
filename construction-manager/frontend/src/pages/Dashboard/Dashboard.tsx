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
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Активные проекты"
            value={25}
            change={12}
            icon={<Assignment />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Сотрудники"
            value={148}
            change={5}
            icon={<People />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Доходы (млн ₽)"
            value="2.4"
            change={8}
            icon={<AccountBalance />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Материалы на складе"
            value={1250}
            change={-3}
            icon={<Inventory />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* График проектов */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Динамика проектов
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="active" fill="#1976d2" name="Активные" />
                  <Bar dataKey="completed" fill="#4caf50" name="Завершенные" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Финансовая диаграмма */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Финансовая сводка
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={financialData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {financialData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `${(value / 1000000).toFixed(1)} млн ₽`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Последние проекты */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Текущие проекты
                </Typography>
                <Button size="small">Все проекты</Button>
              </Box>
              <List>
                {recentProjects.map((project) => (
                  <ListItem key={project.id} divider>
                    <ListItemIcon>
                      {project.status === 'completed' ? (
                        <CheckCircle color="success" />
                      ) : project.status === 'warning' ? (
                        <Warning color="warning" />
                      ) : (
                        <Schedule color="primary" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={project.name}
                      secondary={`Прогресс: ${project.progress}%`}
                    />
                    <IconButton size="small">
                      <MoreVert />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Последние задачи */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Срочные задачи
                </Typography>
                <Button size="small">Все задачи</Button>
              </Box>
              <List>
                {recentTasks.map((task) => (
                  <ListItem key={task.id} divider>
                    <ListItemText
                      primary={task.title}
                      secondary={`${task.assignee} • ${task.dueDate}`}
                    />
                    <Chip
                      label={
                        task.priority === 'high' ? 'Высокий' :
                        task.priority === 'medium' ? 'Средний' : 'Низкий'
                      }
                      size="small"
                      color={
                        task.priority === 'high' ? 'error' :
                        task.priority === 'medium' ? 'warning' : 'default'
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;