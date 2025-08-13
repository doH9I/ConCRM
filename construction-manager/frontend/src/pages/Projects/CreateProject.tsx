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
} from '@mui/material';
import {
  Save,
  Cancel,
  Business,
  AccountBalance,
  CalendarToday,
  Person,
  LocationOn,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { CreateProjectForm } from '../../types';

const steps = ['Основная информация', 'Детали проекта', 'Финансы и сроки'];

// Мокированные данные менеджеров
const mockManagers = [
  { id: 'user1', name: 'Иванов Иван Иванович' },
  { id: 'user2', name: 'Петров Петр Петрович' },
  { id: 'user3', name: 'Сидорова Анна Владимировна' },
];

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateProjectForm>({
    name: '',
    description: '',
    client_name: '',
    client_contact: '',
    start_date: dayjs().format('YYYY-MM-DD'),
    end_date: '',
    budget: 0,
    manager_id: '',
    address: '',
  });

  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (field: keyof CreateProjectForm) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSelectChange = (field: keyof CreateProjectForm) => (
    event: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleDateChange = (field: 'start_date' | 'end_date', setter: (date: Dayjs | null) => void) => (
    newValue: Dayjs | null
  ) => {
    setter(newValue);
    setFormData(prev => ({
      ...prev,
      [field]: newValue ? newValue.format('YYYY-MM-DD') : '',
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(formData.name && formData.client_name && formData.manager_id);
      case 1:
        return !!(formData.description && formData.address);
      case 2:
        return !!(formData.budget > 0 && formData.start_date);
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Здесь будет вызов API для создания проекта
      console.log('Creating project:', formData);
      
      // Симуляция запроса
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Перенаправление на страницу проектов
      navigate('/projects');
    } catch (err) {
      setError('Произошла ошибка при создании проекта');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Название проекта"
                value={formData.name}
                onChange={handleInputChange('name')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Название клиента"
                value={formData.client_name}
                onChange={handleInputChange('client_name')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Контакт клиента"
                value={formData.client_contact}
                onChange={handleInputChange('client_contact')}
                placeholder="+7 (999) 123-45-67"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Менеджер проекта</InputLabel>
                <Select
                  value={formData.manager_id}
                  label="Менеджер проекта"
                  onChange={handleSelectChange('manager_id')}
                  startAdornment={
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  }
                >
                  {mockManagers.map((manager) => (
                    <MenuItem key={manager.id} value={manager.id}>
                      {manager.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Описание проекта"
                value={formData.description}
                onChange={handleInputChange('description')}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Адрес объекта"
                value={formData.address}
                onChange={handleInputChange('address')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Бюджет проекта"
                type="number"
                value={formData.budget || ''}
                onChange={handleInputChange('budget')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountBalance />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Дата начала"
                value={startDate}
                onChange={handleDateChange('start_date', setStartDate)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday />
                        </InputAdornment>
                      ),
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Планируемая дата завершения"
                value={endDate}
                onChange={handleDateChange('end_date', setEndDate)}
                minDate={startDate}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday />
                        </InputAdornment>
                      ),
                    },
                  },
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
        Создание нового проекта
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Заполните информацию о проекте для его создания в системе
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
                onClick={() => navigate('/projects')}
                startIcon={<Cancel />}
                disabled={loading}
              >
                Отмена
              </Button>

              <Box sx={{ display: 'flex', gap: 1 }}>
                {activeStep > 0 && (
                  <Button onClick={handleBack} disabled={loading}>
                    Назад
                  </Button>
                )}

                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!validateStep(activeStep) || loading}
                  >
                    Далее
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSubmit}
                    disabled={!validateStep(activeStep) || loading}
                  >
                    {loading ? 'Создание...' : 'Создать проект'}
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
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Название проекта
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formData.name || '—'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Клиент
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formData.client_name || '—'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Менеджер
              </Typography>
              <Typography variant="body1" gutterBottom>
                {mockManagers.find(m => m.id === formData.manager_id)?.name || '—'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Бюджет
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formData.budget ? `${formData.budget.toLocaleString('ru-RU')} ₽` : '—'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Описание
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formData.description || '—'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateProject;