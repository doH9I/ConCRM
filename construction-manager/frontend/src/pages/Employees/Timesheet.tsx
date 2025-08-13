import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  Fab,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Download,
  FilterList,
  AccessTime,
  Save,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../../services/employeesApi';
import { projectsApi } from '../../services/projectsApi';
import { tasksApi } from '../../services/tasksApi';
import { TimeEntry } from '../../types';

const Timesheet: React.FC = () => {
  const queryClient = useQueryClient();
  
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs().endOf('month'));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    project_id: '',
    task_id: '',
    date: dayjs().format('YYYY-MM-DD'),
    hours: 0,
    description: '',
    is_overtime: false,
  });

  // Запросы данных
  const { data: employeesResponse } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesApi.getEmployees(1, 100),
  });

  const { data: projectsResponse } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getProjects({}, 1, 100),
  });

  const { data: tasksResponse } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.getTasks({}, 1, 100),
  });

  const { data: timesheetResponse, isLoading, error } = useQuery({
    queryKey: ['timesheet', selectedEmployee, startDate?.format('YYYY-MM-DD'), endDate?.format('YYYY-MM-DD')],
    queryFn: () => employeesApi.getTimesheet(
      selectedEmployee || undefined,
      startDate?.format('YYYY-MM-DD'),
      endDate?.format('YYYY-MM-DD')
    ),
  });

  // Мутации
  const addTimeEntryMutation = useMutation({
    mutationFn: employeesApi.addTimeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet'] });
      handleCloseDialog();
    },
  });

  const updateTimeEntryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TimeEntry> }) =>
      employeesApi.updateTimeEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet'] });
      handleCloseDialog();
    },
  });

  const deleteTimeEntryMutation = useMutation({
    mutationFn: employeesApi.deleteTimeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet'] });
    },
  });

  const employees = employeesResponse?.data || [];
  const projects = projectsResponse?.data || [];
  const tasks = tasksResponse?.data || [];
  const timeEntries = timesheetResponse?.data || [];

  const handleOpenDialog = (entry?: TimeEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        employee_id: entry.employee_id,
        project_id: entry.project_id || '',
        task_id: entry.task_id || '',
        date: entry.date,
        hours: entry.hours,
        description: entry.description || '',
        is_overtime: entry.is_overtime,
      });
    } else {
      setEditingEntry(null);
      setFormData({
        employee_id: selectedEmployee || '',
        project_id: '',
        task_id: '',
        date: dayjs().format('YYYY-MM-DD'),
        hours: 0,
        description: '',
        is_overtime: false,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEntry(null);
  };

  const handleSave = () => {
    if (editingEntry) {
      updateTimeEntryMutation.mutate({
        id: editingEntry.id,
        data: formData,
      });
    } else {
      addTimeEntryMutation.mutate(formData);
    }
  };

  const handleDelete = (entryId: string) => {
    deleteTimeEntryMutation.mutate(entryId);
  };

  const handleExport = async () => {
    try {
      const blob = await employeesApi.exportTimesheet(
        startDate!.format('YYYY-MM-DD'),
        endDate!.format('YYYY-MM-DD'),
        selectedEmployee || undefined
      );
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timesheet_${dayjs().format('YYYY_MM_DD')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Ошибка экспорта:', error);
    }
  };

  const getTotalHours = () => {
    return timeEntries.reduce((total, entry) => total + entry.hours, 0);
  };

  const getOvertimeHours = () => {
    return timeEntries.filter(entry => entry.is_overtime).reduce((total, entry) => total + entry.hours, 0);
  };

  // Группировка по сотрудникам
  const groupedEntries = timeEntries.reduce((groups, entry) => {
    const employeeId = entry.employee_id;
    if (!groups[employeeId]) {
      groups[employeeId] = [];
    }
    groups[employeeId].push(entry);
    return groups;
  }, {} as Record<string, TimeEntry[]>);

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Ошибка загрузки табеля: {(error as any).message || 'Неизвестная ошибка'}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Табель учета времени
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
          >
            Экспорт в Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Добавить запись
          </Button>
        </Box>
      </Box>

      {/* Фильтры */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Сотрудник</InputLabel>
                <Select
                  value={selectedEmployee}
                  label="Сотрудник"
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <MenuItem value="">Все сотрудники</MenuItem>
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.full_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Дата с"
                value={startDate}
                onChange={setStartDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Дата по"
                value={endDate}
                onChange={setEndDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSelectedEmployee('');
                  setStartDate(dayjs().startOf('month'));
                  setEndDate(dayjs().endOf('month'));
                }}
              >
                Сбросить
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Статистика */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {getTotalHours()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Всего часов
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                {getOvertimeHours()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Сверхурочных часов
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="info.main">
                {Object.keys(groupedEntries).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Сотрудников с записями
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Таблица записей */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell>Сотрудник</TableCell>
                  <TableCell>Проект</TableCell>
                  <TableCell>Задача</TableCell>
                  <TableCell>Часы</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell>Тип</TableCell>
                  <TableCell align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timeEntries.map((entry) => {
                  const employee = employees.find(emp => emp.id === entry.employee_id);
                  const project = projects.find(proj => proj.id === entry.project_id);
                  const task = tasks.find(t => t.id === entry.task_id);

                  return (
                    <TableRow key={entry.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {dayjs(entry.date).format('DD.MM.YYYY')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {employee?.full_name || 'Неизвестно'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {project ? (
                          <Chip
                            label={project.name}
                            size="small"
                            variant="outlined"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {task ? (
                          <Typography variant="body2">
                            {task.title}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {entry.hours} ч
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                          {entry.description || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={entry.is_overtime ? 'Сверхурочно' : 'Обычное'}
                          color={entry.is_overtime ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(entry)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(entry.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {timeEntries.length === 0 && !isLoading && (
            <Box textAlign="center" py={8}>
              <AccessTime sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Записи не найдены
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Попробуйте изменить период или добавьте новую запись времени
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
              >
                Добавить запись времени
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Диалог добавления/редактирования записи */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingEntry ? 'Редактировать запись времени' : 'Добавить запись времени'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Сотрудник</InputLabel>
                <Select
                  value={formData.employee_id}
                  label="Сотрудник"
                  onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                >
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.full_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Дата"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Проект</InputLabel>
                <Select
                  value={formData.project_id}
                  label="Проект"
                  onChange={(e) => setFormData(prev => ({ ...prev, project_id: e.target.value }))}
                >
                  <MenuItem value="">Без проекта</MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Задача</InputLabel>
                <Select
                  value={formData.task_id}
                  label="Задача"
                  onChange={(e) => setFormData(prev => ({ ...prev, task_id: e.target.value }))}
                >
                  <MenuItem value="">Без задачи</MenuItem>
                  {tasks
                    .filter(task => !formData.project_id || task.project_id === formData.project_id)
                    .map((task) => (
                      <MenuItem key={task.id} value={task.id}>
                        {task.title}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Количество часов"
                value={formData.hours || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, hours: Number(e.target.value) }))}
                inputProps={{ min: 0, step: 0.5 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Тип времени</InputLabel>
                <Select
                  value={formData.is_overtime ? 'overtime' : 'regular'}
                  label="Тип времени"
                  onChange={(e) => setFormData(prev => ({ ...prev, is_overtime: e.target.value === 'overtime' }))}
                >
                  <MenuItem value="regular">Обычное время</MenuItem>
                  <MenuItem value="overtime">Сверхурочное</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Описание работы"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button 
            variant="contained" 
            startIcon={<Save />}
            onClick={handleSave}
            disabled={!formData.employee_id || !formData.hours || 
              addTimeEntryMutation.isPending || updateTimeEntryMutation.isPending}
          >
            {addTimeEntryMutation.isPending || updateTimeEntryMutation.isPending ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* FAB для быстрого добавления */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog()}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default Timesheet;