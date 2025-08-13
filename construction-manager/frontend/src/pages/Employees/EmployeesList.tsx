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
  Avatar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Person,
  Phone,
  Email,
  Work,
  Upload,
  Download,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../../services/employeesApi';
import { Employee } from '../../types';
import dayjs from 'dayjs';

const EmployeesList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  // Запросы данных
  const { data: employeesResponse, isLoading, error } = useQuery({
    queryKey: ['employees', searchQuery, departmentFilter, statusFilter, page],
    queryFn: () => employeesApi.getEmployees(page, 20, {
      search: searchQuery,
      department: departmentFilter,
      status: statusFilter,
    }),
  });

  // Мутации
  const deleteEmployeeMutation = useMutation({
    mutationFn: employeesApi.deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      handleMenuClose();
    },
  });

  const importEmployeesMutation = useMutation({
    mutationFn: employeesApi.importEmployees,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setImportDialogOpen(false);
      setImportFile(null);
    },
  });

  const employees = employeesResponse?.data || [];
  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, employeeId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employeeId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmployee(null);
  };

  const handleViewEmployee = () => {
    if (selectedEmployee) {
      navigate(`/employees/detail/${selectedEmployee}`);
    }
    handleMenuClose();
  };

  const handleEditEmployee = () => {
    if (selectedEmployee) {
      navigate(`/employees/edit/${selectedEmployee}`);
    }
    handleMenuClose();
  };

  const handleDeleteEmployee = () => {
    if (selectedEmployee) {
      deleteEmployeeMutation.mutate(selectedEmployee);
    }
  };

  const handleExportTimesheet = async () => {
    try {
      const startDate = dayjs().startOf('month').format('YYYY-MM-DD');
      const endDate = dayjs().endOf('month').format('YYYY-MM-DD');
      const blob = await employeesApi.exportTimesheet(startDate, endDate);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timesheet_${dayjs().format('YYYY_MM')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Ошибка экспорта:', error);
    }
  };

  const handleImportEmployees = () => {
    if (importFile) {
      importEmployeesMutation.mutate(importFile);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'on_leave': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'inactive': return 'Неактивен';
      case 'on_leave': return 'В отпуске';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Ошибка загрузки сотрудников: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Сотрудники
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => setImportDialogOpen(true)}
          >
            Импорт
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportTimesheet}
          >
            Экспорт табеля
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/employees/create')}
          >
            Добавить сотрудника
          </Button>
        </Box>
      </Box>

      {/* Фильтры */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Поиск по имени, должности"
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Отдел</InputLabel>
                <Select
                  value={departmentFilter}
                  label="Отдел"
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <MenuItem value="">Все</MenuItem>
                  {departments.map((department) => (
                    <MenuItem key={department} value={department}>
                      {department}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                  <MenuItem value="active">Активен</MenuItem>
                  <MenuItem value="inactive">Неактивен</MenuItem>
                  <MenuItem value="on_leave">В отпуске</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearchQuery('');
                  setDepartmentFilter('');
                  setStatusFilter('');
                }}
              >
                Очистить фильтры
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Таблица сотрудников */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Сотрудник</TableCell>
                  <TableCell>Должность</TableCell>
                  <TableCell>Отдел</TableCell>
                  <TableCell>Контакты</TableCell>
                  <TableCell>Зарплата</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Дата найма</TableCell>
                  <TableCell align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow 
                    key={employee.id} 
                    hover 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/employees/detail/${employee.id}`)}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {employee.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {employee.full_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {employee.id.slice(0, 8)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {employee.position}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {employee.department || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {employee.phone && (
                          <Box display="flex" alignItems="center" mb={0.5}>
                            <Phone sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {employee.phone}
                            </Typography>
                          </Box>
                        )}
                        {employee.email && (
                          <Box display="flex" alignItems="center">
                            <Email sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {employee.email}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(employee.salary)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(employee.status)}
                        color={getStatusColor(employee.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {dayjs(employee.hire_date).format('DD.MM.YYYY')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuClick(e, employee.id);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {employees.length === 0 && !isLoading && (
            <Box textAlign="center" py={8}>
              <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Сотрудники не найдены
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Попробуйте изменить критерии поиска или добавьте нового сотрудника
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/employees/create')}
              >
                Добавить первого сотрудника
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
        <MenuItem onClick={handleViewEmployee}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>Просмотр</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditEmployee}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Редактировать</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteEmployee} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>

      {/* Диалог импорта */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Импорт сотрудников из Excel</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Выберите Excel файл с данными сотрудников для импорта
          </Typography>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            style={{ marginTop: 16 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Отмена</Button>
          <Button 
            variant="contained" 
            onClick={handleImportEmployees}
            disabled={!importFile || importEmployeesMutation.isPending}
          >
            {importEmployeesMutation.isPending ? 'Импорт...' : 'Импортировать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeesList;