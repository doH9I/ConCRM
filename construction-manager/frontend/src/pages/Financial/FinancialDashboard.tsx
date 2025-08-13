import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  AttachMoney,
  TrendingFlat,
  ArrowUpward,
  ArrowDownward,
  Assignment,
  Receipt,
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
  Area,
  AreaChart,
} from 'recharts';

// Мокированные данные
const monthlyData = [
  { name: 'Янв', income: 4500000, expense: 3200000, profit: 1300000 },
  { name: 'Фев', income: 5200000, expense: 3800000, profit: 1400000 },
  { name: 'Мар', income: 4800000, expense: 3500000, profit: 1300000 },
  { name: 'Апр', income: 6100000, expense: 4200000, profit: 1900000 },
  { name: 'Май', income: 5800000, expense: 4000000, profit: 1800000 },
  { name: 'Июн', income: 6500000, expense: 4500000, profit: 2000000 },
];

const expenseCategories = [
  { name: 'Материалы', value: 8500000, color: '#8884d8' },
  { name: 'Зарплата', value: 5200000, color: '#82ca9d' },
  { name: 'Техника', value: 3100000, color: '#ffc658' },
  { name: 'Подрядчики', value: 4200000, color: '#ff7c7c' },
  { name: 'Прочее', value: 1500000, color: '#8dd1e1' },
];

const recentOperations = [
  { id: '1', type: 'income', description: 'Оплата от ООО "СтройИнвест"', amount: 2500000, date: '2024-01-15', project: 'ЖК "Северная звезда"' },
  { id: '2', type: 'expense', description: 'Закупка арматуры', amount: 850000, date: '2024-01-14', project: 'ЖК "Северная звезда"' },
  { id: '3', type: 'expense', description: 'Заработная плата', amount: 1200000, date: '2024-01-13', project: 'Общие расходы' },
  { id: '4', type: 'income', description: 'Промежуточная оплата', amount: 1800000, date: '2024-01-12', project: 'Офисный центр' },
  { id: '5', type: 'expense', description: 'Аренда техники', amount: 450000, date: '2024-01-11', project: 'Школа №125' },
];

const StatCard: React.FC<{
  title: string;
  value: string;
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
            ) : change < 0 ? (
              <TrendingDown sx={{ color: 'error.main', mr: 0.5 }} fontSize="small" />
            ) : (
              <TrendingFlat sx={{ color: 'warning.main', mr: 0.5 }} fontSize="small" />
            )}
            <Typography
              variant="body2"
              color={change > 0 ? 'success.main' : change < 0 ? 'error.main' : 'warning.main'}
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

const FinancialDashboard: React.FC = () => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyShort = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} млн ₽`;
    }
    return formatCurrency(amount);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Финансовый обзор
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Текущее финансовое состояние и аналитика
      </Typography>

      {/* Статистические карточки */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Общий доход"
            value="32.9 млн ₽"
            change={12}
            icon={<ArrowUpward />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Общие расходы"
            value="22.5 млн ₽"
            change={8}
            icon={<ArrowDownward />}
            color="#f44336"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Чистая прибыль"
            value="10.4 млн ₽"
            change={15}
            icon={<AttachMoney />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Средства на счетах"
            value="8.7 млн ₽"
            change={-2}
            icon={<AccountBalance />}
            color="#ff9800"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* График доходов и расходов */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Динамика доходов и расходов
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrencyShort(value)} />
                  <Tooltip formatter={(value: any) => formatCurrencyShort(value)} />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stackId="1"
                    stroke="#4caf50"
                    fill="#4caf50"
                    fillOpacity={0.6}
                    name="Доходы"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stackId="2"
                    stroke="#f44336"
                    fill="#f44336"
                    fillOpacity={0.6}
                    name="Расходы"
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#2196f3"
                    strokeWidth={3}
                    name="Прибыль"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Структура расходов */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Структура расходов
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrencyShort(value)} />
                </PieChart>
              </ResponsiveContainer>
              <Box mt={2}>
                {expenseCategories.map((category, index) => (
                  <Box key={index} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Box display="flex" alignItems="center">
                      <Box
                        width={12}
                        height={12}
                        bgcolor={category.color}
                        borderRadius="50%"
                        mr={1}
                      />
                      <Typography variant="body2">
                        {category.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrencyShort(category.value)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Последние операции */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Последние операции
                </Typography>
                <Button size="small">Все операции</Button>
              </Box>
              <List>
                {recentOperations.map((operation, index) => (
                  <ListItem key={operation.id} divider={index < recentOperations.length - 1}>
                    <ListItemIcon>
                      {operation.type === 'income' ? (
                        <ArrowUpward color="success" />
                      ) : (
                        <ArrowDownward color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={operation.description}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {operation.project} • {new Date(operation.date).toLocaleDateString('ru-RU')}
                          </Typography>
                        </Box>
                      }
                    />
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={operation.type === 'income' ? 'success.main' : 'error.main'}
                    >
                      {operation.type === 'income' ? '+' : '-'}{formatCurrencyShort(operation.amount)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Финансовые показатели */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ключевые показатели
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center" p={2} bgcolor="success.light" borderRadius={2}>
                    <Typography variant="h5" fontWeight="bold" color="success.contrastText">
                      31.6%
                    </Typography>
                    <Typography variant="body2" color="success.contrastText">
                      Рентабельность
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center" p={2} bgcolor="info.light" borderRadius={2}>
                    <Typography variant="h5" fontWeight="bold" color="info.contrastText">
                      68%
                    </Typography>
                    <Typography variant="body2" color="info.contrastText">
                      Использование бюджета
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center" p={2} bgcolor="warning.light" borderRadius={2}>
                    <Typography variant="h5" fontWeight="bold" color="warning.contrastText">
                      12
                    </Typography>
                    <Typography variant="body2" color="warning.contrastText">
                      Дней до платежа
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center" p={2} bgcolor="error.light" borderRadius={2}>
                    <Typography variant="h5" fontWeight="bold" color="error.contrastText">
                      2.1 млн
                    </Typography>
                    <Typography variant="body2" color="error.contrastText">
                      Просроченные ₽
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinancialDashboard;