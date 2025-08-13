import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Save,
  Cancel,
  Person,
  Email,
  Phone,
  Work,
  AttachMoney,
  CalendarMonth,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../../services/employeesApi';
import { CreateEmployeeForm } from '../../types';

const steps = ['Личная информация', 'Трудовые данные', 'Контакты и заключение'];

const departments = [
  'Администрация',
  'Проектный отдел',
  'Строительство',
  'Снабжение',
  'Бухгалтерия',
  'HR',
  'IT',
];

const positions = [
  'Директор',
  'Заместитель директора',
  'Главный инженер',
  'Архитектор',
  'Инженер-проектировщик',
  'Прораб',
  'Мастер',
  'Строитель',
  'Менеджер по закупкам',
  'Снабженец',
  'Бухгалтер',
  'HR-менеджер',
  'Системный администратор',
];

const CreateEmployee: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<CreateEmployeeForm>({
    full_name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    salary: 0,
    hire_date: dayjs().format('YYYY-MM-DD'),
    status: 'active',
    passport_series: '',
    passport_number: '',
    passport_issued_by: '',
    passport_issued_date: '',
    address: '',
    tax_id: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  const [hireDatePicker, setHireDatePicker] = useState<Dayjs | null>(dayjs());
  const [passportDatePicker, setPassportDatePicker] = useState<Dayjs | null>(null);
  const [error, setError] = useState('');

  // Мутация создания сотрудника
  const createEmployeeMutation = useMutation({
    mutationFn: employeesApi.createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      navigate('/employees');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Ошибка создания сотрудника');
    },
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (field: keyof CreateEmployeeForm) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = field === 'salary' ? Number(event.target.value) : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectChange = (field: keyof CreateEmployeeForm) => (
    event: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleHireDateChange = (newValue: Dayjs | null) => {
    setHireDatePicker(newValue);
    setFormData(prev => ({
      ...prev,
      hire_date: newValue ? newValue.format('YYYY-MM-DD') : '',
    }));
  };

  const handlePassportDateChange = (newValue: Dayjs | null) => {
    setPassportDatePicker(newValue);
    setFormData(prev => ({
      ...prev,
      passport_issued_date: newValue ? newValue.format('YYYY-MM-DD') : '',
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(formData.full_name && formData.passport_series && formData.passport_number);
      case 1:
        return !!(formData.position && formData.department && formData.salary && formData.hire_date);
      case 2:
        return !!(formData.email || formData.phone);
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setError('');
    createEmployeeMutation.mutate(formData);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} display="flex" justifyContent="center" mb={2}>
              <Avatar sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: 'primary.main' }}>
                {formData.full_name ? getInitials(formData.full_name) : <Person />}
              </Avatar>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ФИО"
                value={formData.full_name}
                onChange={handleInputChange('full_name')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Серия паспорта"
                value={formData.passport_series}
                onChange={handleInputChange('passport_series')}
                required
                inputProps={{ maxLength: 4 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Номер паспорта"
                value={formData.passport_number}
                onChange={handleInputChange('passport_number')}
                required
                inputProps={{ maxLength: 6 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Кем выдан паспорт"
                value={formData.passport_issued_by}
                onChange={handleInputChange('passport_issued_by')}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Дата выдачи паспорта"
                value={passportDatePicker}
                onChange={handlePassportDateChange}
                maxDate={dayjs()}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ИНН"
                value={formData.tax_id}
                onChange={handleInputChange('tax_id')}
                inputProps={{ maxLength: 12 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Адрес проживания"
                value={formData.address}
                onChange={handleInputChange('address')}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Должность</InputLabel>
                <Select
                  value={formData.position}
                  label="Должность"
                  onChange={handleSelectChange('position')}
                  startAdornment={
                    <InputAdornment position="start">
                      <Work />
                    </InputAdornment>
                  }
                >
                  {positions.map((position) => (
                    <MenuItem key={position} value={position}>
                      {position}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Отдел</InputLabel>
                <Select
                  value={formData.department}
                  label="Отдел"
                  onChange={handleSelectChange('department')}
                >
                  {departments.map((department) => (
                    <MenuItem key={department} value={department}>
                      {department}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Зарплата"
                type="number"
                value={formData.salary || ''}
                onChange={handleInputChange('salary')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Дата приема на работу"
                value={hireDatePicker}
                onChange={handleHireDateChange}
                maxDate={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarMonth />
                        </InputAdornment>
                      ),
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={formData.status}
                  label="Статус"
                  onChange={handleSelectChange('status')}
                >
                  <MenuItem value="active">Активен</MenuItem>
                  <MenuItem value="inactive">Неактивен</MenuItem>
                  <MenuItem value="on_leave">В отпуске</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Телефон"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Экстренный контакт
                </Typography>
              </Divider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ФИО контактного лица"
                value={formData.emergency_contact_name}
                onChange={handleInputChange('emergency_contact_name')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Телефон контактного лица"
                value={formData.emergency_contact_phone}
                onChange={handleInputChange('emergency_contact_phone')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Добавление нового сотрудника
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Заполните информацию о новом сотруднике для его регистрации в системе
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Card>
          <CardContent>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={() => navigate('/employees')}
                startIcon={<Cancel />}
                disabled={createEmployeeMutation.isPending}
              >
                Отмена
              </Button>

              <Box sx={{ display: 'flex', gap: 1 }}>
                {activeStep > 0 && (
                  <Button 
                    onClick={handleBack} 
                    disabled={createEmployeeMutation.isPending}
                  >
                    Назад
                  </Button>
                )}

                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!validateStep(activeStep) || createEmployeeMutation.isPending}
                  >
                    Далее
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSubmit}
                    disabled={!validateStep(activeStep) || createEmployeeMutation.isPending}
                  >
                    {createEmployeeMutation.isPending ? 'Создание...' : 'Добавить сотрудника'}
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Paper>

      {/* Предварительный просмотр */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Предварительный просмотр
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
                {formData.full_name ? getInitials(formData.full_name) : <Person />}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {formData.full_name || 'Не указано'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formData.position || 'Должность не указана'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formData.department || 'Отдел не указан'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Зарплата
              </Typography>
              <Typography variant="body1">
                {formData.salary ? `${formData.salary.toLocaleString()} ₽` : 'Не указана'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Дата приема
              </Typography>
              <Typography variant="body1">
                {formData.hire_date ? dayjs(formData.hire_date).format('DD.MM.YYYY') : 'Не указана'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">
                {formData.email || 'Не указан'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Телефон
              </Typography>
              <Typography variant="body1">
                {formData.phone || 'Не указан'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Паспорт
              </Typography>
              <Typography variant="body1">
                {formData.passport_series && formData.passport_number 
                  ? `${formData.passport_series} ${formData.passport_number}` 
                  : 'Не указан'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                ИНН
              </Typography>
              <Typography variant="body1">
                {formData.tax_id || 'Не указан'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateEmployee;