import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Edit,
  Delete,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const mockOperations = [
  { id: '1', type: 'income', category: 'Платеж от клиента', amount: 2500000, description: 'Оплата по договору ЖК "Северная звезда"', date: '2024-01-15', project: 'ЖК "Северная звезда"' },
  { id: '2', type: 'expense', category: 'Материалы', amount: 850000, description: 'Закупка арматуры А500С', date: '2024-01-14', project: 'ЖК "Северная звезда"' },
  { id: '3', type: 'expense', category: 'Зарплата', amount: 1200000, description: 'Заработная плата за декабрь', date: '2024-01-13', project: 'Общие расходы' },
  { id: '4', type: 'income', category: 'Промежуточная оплата', amount: 1800000, description: 'Оплата за выполненные работы', date: '2024-01-12', project: 'Офисный центр' },
  { id: '5', type: 'expense', category: 'Техника', amount: 450000, description: 'Аренда крана на 2 недели', date: '2024-01-11', project: 'Школа №125' },
];

const categories = ['Материалы', 'Зарплата', 'Техника', 'Подрядчики', 'Платеж от клиента', 'Промежуточная оплата', 'Прочее'];

const Operations: React.FC = () => {
  const [operations] = useState(mockOperations);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newOperation, setNewOperation] = useState({
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    date: dayjs().format('YYYY-MM-DD'),
    project: '',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddOperation = () => {
    // Здесь будет логика добавления операции
    console.log('Adding operation:', newOperation);
    setOpenDialog(false);
    setNewOperation({
      type: 'expense',
      category: '',
      amount: '',
      description: '',
      date: dayjs().format('YYYY-MM-DD'),
      project: '',
    });
  };

  const filteredOperations = operations.filter(operation => {
    const matchesSearch = !searchQuery || 
      operation.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      operation.project.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !typeFilter || operation.type === typeFilter;
    const matchesCategory = !categoryFilter || operation.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Финансовые операции
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Добавить операцию
        </Button>
      </Box>

      {/* Фильтры */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
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
                <InputLabel>Тип</InputLabel>
                <Select
                  value={typeFilter}
                  label="Тип"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="">Все</MenuItem>
                  <MenuItem value="income">Доходы</MenuItem>
                  <MenuItem value="expense">Расходы</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Категория</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Категория"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">Все</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('');
                  setCategoryFilter('');
                }}
              >
                Очистить фильтры
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Таблица операций */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell>Тип</TableCell>
                  <TableCell>Категория</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell>Проект</TableCell>
                  <TableCell align="right">Сумма</TableCell>
                  <TableCell align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOperations.map((operation) => (
                  <TableRow key={operation.id} hover>
                    <TableCell>
                      {dayjs(operation.date).format('DD.MM.YYYY')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={operation.type === 'income' ? <TrendingUp /> : <TrendingDown />}
                        label={operation.type === 'income' ? 'Доход' : 'Расход'}
                        color={operation.type === 'income' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{operation.category}</TableCell>
                    <TableCell>{operation.description}</TableCell>
                    <TableCell>{operation.project}</TableCell>
                    <TableCell align="right">
                      <Typography
                        fontWeight="bold"
                        color={operation.type === 'income' ? 'success.main' : 'error.main'}
                      >
                        {operation.type === 'income' ? '+' : '-'}{formatCurrency(operation.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Диалог добавления операции */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Добавить финансовую операцию</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Тип операции</InputLabel>
                <Select
                  value={newOperation.type}
                  label="Тип операции"
                  onChange={(e) => setNewOperation(prev => ({ ...prev, type: e.target.value }))}
                >
                  <MenuItem value="income">Доход</MenuItem>
                  <MenuItem value="expense">Расход</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Категория</InputLabel>
                <Select
                  value={newOperation.category}
                  label="Категория"
                  onChange={(e) => setNewOperation(prev => ({ ...prev, category: e.target.value }))}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Сумма"
                type="number"
                value={newOperation.amount}
                onChange={(e) => setNewOperation(prev => ({ ...prev, amount: e.target.value }))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Дата операции"
                value={dayjs(newOperation.date)}
                onChange={(newValue) => setNewOperation(prev => ({ 
                  ...prev, 
                  date: newValue ? newValue.format('YYYY-MM-DD') : '' 
                }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Описание"
                value={newOperation.description}
                onChange={(e) => setNewOperation(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Проект"
                value={newOperation.project}
                onChange={(e) => setNewOperation(prev => ({ ...prev, project: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleAddOperation}>
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Operations;