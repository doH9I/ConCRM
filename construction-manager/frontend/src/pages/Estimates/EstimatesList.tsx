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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  FileCopy,
  Description,
  Upload,
  Download,
  GetApp,
  TableChart,
  CheckCircle,
  Schedule,
  Assignment,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estimatesApi } from '../../services/estimatesApi';
import { projectsApi } from '../../services/projectsApi';
import { Estimate } from '../../types';
import dayjs from 'dayjs';

const EstimatesList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<string | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [newEstimateName, setNewEstimateName] = useState('');

  // Запросы данных
  const { data: estimatesResponse, isLoading, error } = useQuery({
    queryKey: ['estimates', searchQuery, projectFilter, statusFilter, page],
    queryFn: () => estimatesApi.getEstimates(page, 20, {
      search: searchQuery,
      project_id: projectFilter,
      status: statusFilter,
    }),
  });

  const { data: projectsResponse } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getProjects({}, 1, 100),
  });

  // Мутации
  const deleteEstimateMutation = useMutation({
    mutationFn: estimatesApi.deleteEstimate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      handleMenuClose();
    },
  });

  const copyEstimateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => 
      estimatesApi.copyEstimate(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      setCopyDialogOpen(false);
      setNewEstimateName('');
    },
  });

  const importEstimateMutation = useMutation({
    mutationFn: estimatesApi.importEstimate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      setImportDialogOpen(false);
      setImportFile(null);
    },
  });

  const estimates = estimatesResponse?.data || [];
  const projects = projectsResponse?.data || [];

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, estimateId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedEstimate(estimateId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEstimate(null);
  };

  const handleViewEstimate = () => {
    if (selectedEstimate) {
      navigate(`/estimates/detail/${selectedEstimate}`);
    }
    handleMenuClose();
  };

  const handleEditEstimate = () => {
    if (selectedEstimate) {
      navigate(`/estimates/edit/${selectedEstimate}`);
    }
    handleMenuClose();
  };

  const handleDeleteEstimate = () => {
    if (selectedEstimate) {
      deleteEstimateMutation.mutate(selectedEstimate);
    }
  };

  const handleCopyEstimate = () => {
    if (selectedEstimate) {
      const estimate = estimates.find(e => e.id === selectedEstimate);
      setNewEstimateName(`Копия ${estimate?.name || 'сметы'}`);
      setCopyDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleExportEstimate = async (format: 'excel' | 'pdf' = 'excel') => {
    if (!selectedEstimate) return;
    
    try {
      const blob = await estimatesApi.exportEstimate(selectedEstimate, format);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `estimate_${selectedEstimate}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Ошибка экспорта:', error);
    }
    handleMenuClose();
  };

  const handleImportEstimate = () => {
    if (importFile) {
      importEstimateMutation.mutate(importFile);
    }
  };

  const handleConfirmCopy = () => {
    if (selectedEstimate && newEstimateName) {
      copyEstimateMutation.mutate({ id: selectedEstimate, name: newEstimateName });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'in_review': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Черновик';
      case 'approved': return 'Утверждена';
      case 'rejected': return 'Отклонена';
      case 'in_review': return 'На рассмотрении';
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
        Ошибка загрузки смет: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Сметы
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => setImportDialogOpen(true)}
          >
            Импорт из Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/estimates/create')}
          >
            Создать смету
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
                label="Поиск по названию"
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
                <InputLabel>Проект</InputLabel>
                <Select
                  value={projectFilter}
                  label="Проект"
                  onChange={(e) => setProjectFilter(e.target.value)}
                >
                  <MenuItem value="">Все</MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
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
                  <MenuItem value="draft">Черновик</MenuItem>
                  <MenuItem value="in_review">На рассмотрении</MenuItem>
                  <MenuItem value="approved">Утверждена</MenuItem>
                  <MenuItem value="rejected">Отклонена</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearchQuery('');
                  setProjectFilter('');
                  setStatusFilter('');
                }}
              >
                Очистить фильтры
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Таблица смет */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Смета</TableCell>
                  <TableCell>Проект</TableCell>
                  <TableCell>Сумма</TableCell>
                  <TableCell>Позиций</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Обновлена</TableCell>
                  <TableCell align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {estimates.map((estimate) => {
                  const project = projects.find(p => p.id === estimate.project_id);
                  
                  return (
                    <TableRow 
                      key={estimate.id} 
                      hover 
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/estimates/detail/${estimate.id}`)}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: 'info.main' }}>
                            <TableChart />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {estimate.name}
                            </Typography>
                            {estimate.description && (
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {estimate.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {project ? (
                          <Chip
                            label={project.name}
                            variant="outlined"
                            size="small"
                            icon={<Assignment />}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Без проекта
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(estimate.total_amount || 0)}
                        </Typography>
                        {estimate.total_with_vat && estimate.total_with_vat !== estimate.total_amount && (
                          <Typography variant="caption" color="text.secondary">
                            с НДС: {formatCurrency(estimate.total_with_vat)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {estimate.items_count || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(estimate.status)}
                          color={getStatusColor(estimate.status)}
                          size="small"
                          icon={
                            estimate.status === 'approved' ? <CheckCircle /> :
                            estimate.status === 'in_review' ? <Schedule /> : undefined
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {dayjs(estimate.updated_at).format('DD.MM.YYYY')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(estimate.updated_at).format('HH:mm')}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuClick(e, estimate.id);
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {estimates.length === 0 && !isLoading && (
            <Box textAlign="center" py={8}>
              <TableChart sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Сметы не найдены
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Попробуйте изменить критерии поиска или создайте новую смету
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/estimates/create')}
              >
                Создать первую смету
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
        <MenuItem onClick={handleViewEstimate}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>Просмотр</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditEstimate}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Редактировать</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCopyEstimate}>
          <ListItemIcon>
            <FileCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Копировать</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleExportEstimate('excel')}>
          <ListItemIcon>
            <GetApp fontSize="small" />
          </ListItemIcon>
          <ListItemText>Экспорт в Excel</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExportEstimate('pdf')}>
          <ListItemIcon>
            <Description fontSize="small" />
          </ListItemIcon>
          <ListItemText>Экспорт в PDF</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteEstimate} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>

      {/* Диалог импорта */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Импорт сметы из Excel</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Выберите Excel файл со сметой для импорта
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
            onClick={handleImportEstimate}
            disabled={!importFile || importEstimateMutation.isPending}
          >
            {importEstimateMutation.isPending ? 'Импорт...' : 'Импортировать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог копирования */}
      <Dialog open={copyDialogOpen} onClose={() => setCopyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Копировать смету</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Название новой сметы"
            value={newEstimateName}
            onChange={(e) => setNewEstimateName(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCopyDialogOpen(false)}>Отмена</Button>
          <Button 
            variant="contained" 
            onClick={handleConfirmCopy}
            disabled={!newEstimateName || copyEstimateMutation.isPending}
          >
            {copyEstimateMutation.isPending ? 'Копирование...' : 'Копировать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EstimatesList;