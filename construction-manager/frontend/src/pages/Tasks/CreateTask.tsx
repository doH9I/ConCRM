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
  Assignment,
  Schedule,
  Person,
  Flag,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../../services/tasksApi';
import { projectsApi } from '../../services/projectsApi';
import { CreateTaskForm } from '../../types';

const steps = ['Основная информация', 'Детали и сроки', 'Назначение'];

const CreateTask: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<CreateTaskForm>({
    project_id: '',
    stage_id: '',
    title: '',
    description: '',
    priority: 'medium',
    assigned_to: '',
    due_date: '',
    estimated_hours: 0,
  });

  const [dueDate, setDueDate] = useState<Dayjs | null>(null);
  const [error, setError] = useState('');

  // Запросы данных
  const { data: projectsResponse } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getProjects({}, 1, 100),
  });

  const { data: stagesResponse } = useQuery({
    queryKey: ['project-stages', formData.project_id],
    queryFn: () => formData.project_id ? projectsApi.getProjectStages(formData.project_id) : Promise.resolve({ data: [] }),
    enabled: !!formData.project_id,
  });

  // Мутация создания задачи
  const createTaskMutation = useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      navigate('/tasks');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Ошибка создания задачи');
    },
  });

  const projects = projectsResponse?.data || [];
  const stages = stagesResponse?.data || [];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (field: keyof CreateTaskForm) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSelectChange = (field: keyof CreateTaskForm) => (
    event: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    setDueDate(newValue);
    setFormData(prev => ({
      ...prev,
      due_date: newValue ? newValue.format('YYYY-MM-DD') : '',
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(formData.title && formData.project_id);
      case 1:
        return !!(formData.description && formData.priority);
      case 2:
        return true; // Назначение не обязательно
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setError('');
    createTaskMutation.mutate(formData);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Название задачи"
                value={formData.title}
                onChange={handleInputChange('title')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Assignment />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Проект</InputLabel>
                <Select
                  value={formData.project_id}
                  label="Проект"
                  onChange={handleSelectChange('project_id')}
                >
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
                <InputLabel>Этап проекта</InputLabel>
                <Select
                  value={formData.stage_id || ''}
                  label="Этап проекта"
                  onChange={handleSelectChange('stage_id')}
                  disabled={!formData.project_id}
                >
                  <MenuItem value="">Без этапа</MenuItem>
                  {stages.map((stage: any) => (
                    <MenuItem key={stage.id} value={stage.id}>
                      {stage.name}
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
                label="Описание задачи"
                value={formData.description}
                onChange={handleInputChange('description')}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Приоритет</InputLabel>
                <Select
                  value={formData.priority}
                  label="Приоритет"
                  onChange={handleSelectChange('priority')}
                  startAdornment={
                    <InputAdornment position="start">
                      <Flag />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="low">Низкий</MenuItem>
                  <MenuItem value="medium">Средний</MenuItem>
                  <MenuItem value="high">Высокий</MenuItem>
                  <MenuItem value="urgent">Срочно</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Плановые часы"
                type="number"
                value={formData.estimated_hours || ''}
                onChange={handleInputChange('estimated_hours')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Schedule />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">ч</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Исполнитель"
                value={formData.assigned_to || ''}
                onChange={handleInputChange('assigned_to')}
                placeholder="ФИО исполнителя"
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
              <DatePicker
                label="Крайний срок"
                value={dueDate}
                onChange={handleDateChange}
                minDate={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Schedule />
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
        Создание новой задачи
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Заполните информацию о задаче для её создания в системе
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
                onClick={() => navigate('/tasks')}
                startIcon={<Cancel />}
                disabled={createTaskMutation.isPending}
              >
                Отмена
              </Button>

              <Box sx={{ display: 'flex', gap: 1 }}>
                {activeStep > 0 && (
                  <Button 
                    onClick={handleBack} 
                    disabled={createTaskMutation.isPending}
                  >
                    Назад
                  </Button>
                )}

                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!validateStep(activeStep) || createTaskMutation.isPending}
                  >
                    Далее
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSubmit}
                    disabled={!validateStep(activeStep) || createTaskMutation.isPending}
                  >
                    {createTaskMutation.isPending ? 'Создание...' : 'Создать задачу'}
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
                Название задачи
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formData.title || '—'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Проект
              </Typography>
              <Typography variant="body1" gutterBottom>
                {projects.find(p => p.id === formData.project_id)?.name || '—'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Приоритет
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formData.priority === 'low' ? 'Низкий' :
                 formData.priority === 'medium' ? 'Средний' :
                 formData.priority === 'high' ? 'Высокий' :
                 formData.priority === 'urgent' ? 'Срочно' : '—'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Исполнитель
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formData.assigned_to || 'Не назначен'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Плановые часы
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formData.estimated_hours ? `${formData.estimated_hours} ч` : '—'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Крайний срок
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formData.due_date ? dayjs(formData.due_date).format('DD.MM.YYYY') : 'Не указан'}
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

export default CreateTask;